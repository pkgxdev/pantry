#!/usr/bin/ruby

# - we inject our rpath to ensure our libs our found
# - for bottles we replace that in fix-machos.rb with a relocatable prefix
# - in general usage we don’t, so if the user needs to distribute their artifacts,
#   they will need to fix them first, but that's typical anyway.
# - for tea-envs the user probably won’t use tea.xyz/gx/cc even though they *should*
#   and thus we set LDFLAGS in the hope that they will be picked up and the rpath set

$tea_prefix = ENV['TEA_PREFIX'] || `tea --prefix`.chomp
exe = File.basename($0)

# remove duplicates since this in fact embeds the rpath multiple times
# and omit -nodefaultrpaths since it is not a valid flag for clang
args = ARGV.map do |arg|
  arg unless arg == "-Wl,-rpath,#$tea_prefix" or arg == "-nodefaultrpaths"
end.compact

# find next example of ourselves
# this will either pick the Apple provided clang or the tea one
exe_path = ENV['PATH'].split(":").filter { |path|
  path != File.dirname(__FILE__)
}.map { |path|
  "#{path}/#{exe}"
}.find { |path|
  File.exist?(path)
}

abort "couldn’t find #{exe} in `PATH`" unless exe_path

for arg in args do
  # figuring out what “mode” we are operating in is hard
  # we don’t want to add this linker command always because it causes a warning to be
  # output if we are not outputing executables/dylibs and this warning can break
  # configure scripts, however the below is not fully encompassing
  # we aren't sure what the rules are TBH, possibly it is as simple as if the output (`-o`)
  # is a .o then we don’t add the rpath
  if arg.start_with? '-l' or arg.end_with? '.dylib'
    exec exe_path, *args, "-Wl,-rpath,#$tea_prefix"
  end
end

exec exe_path, *args
