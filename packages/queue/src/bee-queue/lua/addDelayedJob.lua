--[[
/*!-----------------------------------------------------------
* Original work Copyright (c) 2015 Lewis J Ellis
* Subsequent revisions Copyright (c) 2017 Mixmax, Inc and Lewis J Ellis
* Released under MIT license
* https://github.com/bee-queue/bee-queue/blob/master/LICENSE
*-----------------------------------------------------------*/

https://github.com/bee-queue/bee-queue/blob/1c2fb849708881408fe22c6527e3f62c33a58755/lib/lua/addDelayedJob.lua
]]

--[[
key 1 -> bq:name:id (job ID counter)
key 2 -> bq:name:jobs
key 3 -> bq:name:delayed
key 4 -> bq:name:earlierDelayed
arg 1 -> job id
arg 2 -> job data
arg 3 -> job delay timestamp
]]
local jobId = ARGV[1]
if jobId == "" then
  jobId = "" .. redis.call("incr", KEYS[1])
  if redis.call("hexists", KEYS[2], jobId) == 1 then return nil end
else
  if redis.call("hexists", KEYS[2], jobId) == 1 then return nil end
end
redis.call("hset", KEYS[2], jobId, ARGV[2])
redis.call("zadd", KEYS[3], tonumber(ARGV[3]), jobId)

-- if this job is the new head, alert the workers that they need to update their timers
-- if we try to do something tricky like checking the delta between this job and the next job, we
-- can enter a pathological case where jobs incrementally creep sooner, and each one never updates
-- the timers
local head = redis.call("zrange", KEYS[3], 0, 0)
if #head > 0 and head[1] == jobId then
  redis.call("publish", KEYS[4], ARGV[3])
end

return jobId