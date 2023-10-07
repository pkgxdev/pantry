local uv = require('luv')
local timer = uv.new_timer()
timer:start(1000, 0, function()
    print("Awake!")
    timer:close()
end)
print("Sleeping");
uv.run()