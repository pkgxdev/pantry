#!/usr/bin/env ruby
# ---
# dependencies:
#   ruby-lang.org: 2
#   bundler.io:
#     version: 3
#     with:
#       gems: [ruby-macho: 3]
# ---

#TODO file.stat.ino where file is Pathname

require 'pathname'
require 'macho'
require 'find'

#TODO lazy & memoized
$tea_prefix = ENV['TEA_PREFIX'] || `tea --prefix`.chomp
abort "set TEA_PREFIX" if $tea_prefix.empty?

$pkg_prefix = ARGV.shift
abort "arg1 should be pkg-prefix" if $pkg_prefix.empty?
$pkg_prefix = Pathname.new($pkg_prefix).realpath.to_s

def fix_id file
  if file.dylib_id != file.filename
    # only do work if we must
    file.change_dylib_id file.filename
    file.write!
  end
end

def links_to_other_tea_libs? file
  file.linked_dylibs.each do |lib|
    return true if lib.start_with? $tea_prefix
    return true if lib.start_with? '@loader_path'
    return true if lib.start_with? '@rpath'
    return true if lib.start_with? '@executable_path'
  end
end

def fix_rpaths file
  #TODO remove spurious rpaths

  rel_path = Pathname.new($tea_prefix).relative_path_from(Pathname.new(file.filename).parent)
  rpath = "@loader_path/#{rel_path}"

  return if file.rpaths.include? rpath
  return unless links_to_other_tea_libs? file

  file.add_rpath rpath
  file.write!
end

def bad_install_names file
  file.linked_dylibs.map do |lib|
    if lib.start_with? '/'
      if Pathname.new(lib).cleanpath.to_s.start_with? $tea_prefix
        lib
      end
    elsif lib.start_with? '@'
      puts "warn:#{file.filename}:#{lib}"
      # noop
    else
      lib
    end
  end.compact
end

def fix_install_names file
  bad_names = bad_install_names(file)
  return if bad_names.empty?
  bad_names.each do |old_name|
    if old_name.start_with? $pkg_prefix
      new_name = Pathname.new(old_name).relative_path_from(Pathname.new(file.filename).parent)
      new_name = "@loader_path/#{new_name}"
    elsif old_name.start_with? '/'
      new_name = Pathname.new(old_name).relative_path_from(Pathname.new($tea_prefix))
      new_name = new_name.sub(%r{/v(\d+)\.\d+\.\d+/}, '/v\1/')
      new_name = "@rpath/#{new_name}"
    else
      new_name = Pathname.new(file.filename).parent.join(old_name).cleanpath = "@loader_path/#{new_name}"
      new_name = "@loader_path/#{new_name}"
    end

    file.change_install_name old_name, new_name
  end

  file.write!
end

def fix file
  file = MachO::MachOFile.new(file)

  case file.filetype
  when :dylib
    fix_id file
    fix_rpaths file
    fix_install_names file
  when :execute
    fix_rpaths file
    fix_install_names file
  when :bundle
    fix_rpaths file
    fix_install_names file
  else
    abort "unknown filetype: #{file.filetype}: #{file.filename}"
  end

rescue MachO::MagicError
  #noop: not a Mach-O file
end

ARGV.each do |arg|
  Find.find(arg) do |file|
    next unless File.file? file and !File.symlink? file
    abs = Pathname.getwd.join(file).to_s
    fix abs
  end
end
