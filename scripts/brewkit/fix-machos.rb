#!/usr/bin/env ruby
# tea brewed ruby works with a tea shebang
# but normal ruby does not, macOS comes with ruby so we just use it
# ---
# dependencies:
#   ruby-lang.org: '>=2'
# args: [ruby]
# ---

require 'bundler/inline'

gemfile do
  source 'https://rubygems.org'
  gem 'ruby-macho', '~> 3'
end

require 'fileutils'
require 'pathname'
require 'macho'
require 'find'

#TODO lazy & memoized
$tea_prefix = ENV['TEA_PREFIX'] || `tea --prefix`.chomp
abort "set TEA_PREFIX" if $tea_prefix.empty?

$pkg_prefix = ARGV.shift
abort "arg1 should be pkg-prefix" if $pkg_prefix.empty?
$pkg_prefix = Pathname.new($pkg_prefix).realpath.to_s

$inodes = Hash.new


def arm?
  def type
    case RUBY_PLATFORM
    when /arm/, /aarch64/ then true
    else false
    end
  end
end

class Fixer
  def initialize(file)
    @file = MachO.open(file)
    @changed = false
  end

  def fix
    case @file.filetype
    when :dylib
      fix_id
      fix_rpaths
      fix_install_names
    when :execute
      fix_rpaths
      fix_install_names
    when :bundle
      fix_rpaths
      fix_install_names
    when :object
      # noop
    else
      throw Error("unknown filetype: #{file.filetype}: #{file.filename}")
    end

    # M1 binaries must be signed
    # changing the macho stuff invalidates the signature
    # this resigns with the default adhoc signing profile
    MachO.codesign!(@file.filename) if @changed and arm?
  end

  def fix_id
    rel_path = Pathname.new(@file.filename).relative_path_from(Pathname.new($tea_prefix))
    id = "@rpath/#{rel_path}"
    if @file.dylib_id != id
      # only do work if we must
      @file.change_dylib_id id
      write
    end
  end

  def write
    stat = File.stat(@file.filename)
    if not stat.writable?
      File.chmod(0644, @file.filename)
      chmoded = true
    end
    @file.write!
    @changed = true
  ensure
    File.chmod(stat.mode, @file.filename) if chmoded
  end

  def links_to_other_tea_libs?
    @file.linked_dylibs.each do |lib|
      # starts_with? @rpath is not enough lol
      # this because we are setting `id` to @rpath now so it's a reasonable indication
      # that we link to tea libs, but the build system for the pkg may well do this for its
      # own libs
      return true if lib.start_with? $tea_prefix or lib.start_with? '@rpath'
    end
    return false
  end

  def fix_rpaths
    #TODO remove spurious rpaths

    dirty = false
    rel_path = Pathname.new($tea_prefix).relative_path_from(Pathname.new(@file.filename).parent)
    rpath = "@loader_path/#{rel_path}"

    if not @file.rpaths.include? rpath and links_to_other_tea_libs?
      @file.add_rpath rpath
      dirty = true
    end

    while @file.rpaths.include? $tea_prefix
      @file.delete_rpath $tea_prefix
      dirty = true
    end

    write if dirty
  end

  def bad_install_names
    @file.linked_dylibs.map do |lib|
      if lib.start_with? '/'
        if Pathname.new(lib).cleanpath.to_s.start_with? $tea_prefix
          lib
        end
      elsif lib.start_with? '@rpath'
        path = Pathname.new(lib.sub(%r{^@rpath}, $tea_prefix))
        if path.exist?
          lib
        else
          puts "warn:#{@file.filename}:#{lib}"
        end
      elsif lib.start_with? '@'
        puts "warn:#{@file.filename}:#{lib}"
        # noop
      else
        lib
      end
    end.compact
  end

  def fix_install_names
    bad_names = bad_install_names
    return if bad_names.empty?

    def fix_tea_prefix s
      s = Pathname.new(s).relative_path_from(Pathname.new($tea_prefix))
      s = s.sub(%r{/v(\d+)\.\d+\.\d+/}, '/v\1/')
      s = s.sub(%r{/(\.\d+)+\.dylib$}, '/.dylib')
      s = "@rpath/#{s}"
      return s
    end

    bad_names.each do |old_name|
      if old_name.start_with? $pkg_prefix
        new_name = Pathname.new(old_name).relative_path_from(Pathname.new(@file.filename).parent)
        new_name = "@loader_path/#{new_name}"
      elsif old_name.start_with? '/'
        new_name = fix_tea_prefix old_name
      elsif old_name.start_with? '@rpath'
        # so far we only feed bad @rpaths that are relative to the tea-prefix
        new_name = fix_tea_prefix old_name.sub(%r{^@rpath}, $tea_prefix)
      else
        # assume they are meant to be relative to lib dir
        new_name = Pathname.new($pkg_prefix).join("lib").relative_path_from(Pathname.new(@file.filename).parent)
        new_name = "@loader_path/#{new_name}/#{old_name}"
      end

      @file.change_install_name old_name, new_name
    end

    write
  end
end

ARGV.each do |arg|
  Find.find(arg) do |file|
    next unless File.file? file and !File.symlink? file
    abs = Pathname.getwd.join(file).to_s
    inode = File.stat(abs).ino
    if $inodes[inode]
      if arm?
        # we have to code-sign on arm AND codesigning breaks the hard link
        # so now we have to re-hardlink
        puts "re-hardlinking #{abs} to #{$inodes[inode]}"
        FileUtils.ln($inodes[inode], abs, :force => true)
      end
      # stuff like git has hardlinks to the same files
      # avoid the work if we already did this inode
      next
    end
    Fixer.new(abs).fix
    $inodes[inode] = abs
  rescue MachO::MagicError
    #noop: not a Mach-O file
  rescue MachO::TruncatedFileError
    #noop: file can’t be a Mach-O file
  end
end
