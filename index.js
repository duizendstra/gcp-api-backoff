function gcpApiBackoff(specs) {
    "use strict";
    // the return function
    let backoff;

    // default 5 retries
    let maxRetries = specs.maxRetries || 5;

    // default 500 miliseconds base time
    let baseWaitTime = specs.baseWaitTime || 500;

    // set the recovery function
    let isCanRecover = specs.isCanRecover;

    // set the cannot recover event
    let onCannotRecover = specs.onCannotRecover;

    // set the retry event
    let onRetry = specs.onRetry;

    // set the maximum retries reached
    let onMaxRetriesReached = specs.onMaxRetriesReached;

    const wait = function (ms) {
        return new Promise(function (resolve) {
            setTimeout(resolve, ms);
        });
    };

    backoff = function (operation, retryCount) {
        return new Promise(function (resolve, reject) {
            retryCount = retryCount || 0;
            return operation()
                .then(resolve)
                .catch(function (err) {

                    // check for the recovery if specified
                    if (typeof isCanRecover === "function") {

                        // execute the recovery check if available
                        if (isCanRecover && isCanRecover(err) === false) {

                            // execute the cannot recover event if available
                            if (typeof onCannotRecover === "function") {
                                onCannotRecover(err);
                            }
                            return reject(err);
                        }
                    }

                    if (retryCount < maxRetries) {
                        retryCount += 1;
                        let waitTime = (Math.pow(2, retryCount) * baseWaitTime) + (Math.round(Math.random() * baseWaitTime));

                        if (typeof specs.onRetry === "function") {
                            onRetry({
                                error: err,
                                retryCount: retryCount,
                                waitTime: waitTime
                            });
                        }

                        return wait(waitTime)
                            .then(backoff.bind(null, operation, retryCount))
                            .then(resolve)
                            .catch(reject);
                    }
                    // return the promise if the maximum retries have been reached
                    if (typeof onMaxRetriesReached === "function") {
                        onMaxRetriesReached({
                            error: err,
                            retryCount: retryCount
                        });
                    }
                    return reject(err);
                });
        });
    };

    return {
        backoff: backoff
    };
}

module.exports = gcpApiBackoff;