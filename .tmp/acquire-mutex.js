const input = $input.first()?.json || {};
const staticData = $getWorkflowStaticData('global');
const now = Date.now();
const runningSince = staticData.runningSince || 0;
if (runningSince && (now - runningSince) < 30 * 60 * 1000) {
  return [{ json: { ...input, mutexBlocked: true, runningSince, slotStartedAt: now } }];
}
staticData.runningSince = now;
staticData.runStartedAt = now;
return [{ json: { ...input, mutexBlocked: false, runningSince: now, slotStartedAt: now } }];
