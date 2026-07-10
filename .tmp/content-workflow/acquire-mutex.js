// Copy of acquire-mutex.js for content workflow folder
const staticData = $getWorkflowStaticData('global');
const input = $input.first()?.json || {};
const now = Date.now();
const LOCK_MS = 45 * 60 * 1000;

if (staticData.runningSince && now - staticData.runningSince < LOCK_MS) {
  return [{ json: { ...input, mutexBlocked: true, mutexReason: 'Another pipeline slot is running' } }];
}

staticData.runningSince = now;
staticData.runStartedAt = now;
return [{ json: { ...input, mutexBlocked: false } }];
