function gcpApiBackoff(specs) {
    "use strict";
    // the return function
    let backoff;

    // start witn zero retries
    let retryCount = 0;

    // default 5 retries
    let maxRetries = specs.maxRetries || 5;

    // default 500 miliseconds base time
    let baseWaitTime = specs.baseWaitTime || 500;

    // set the recovery function
    if (specs.isCanRecover !== undefined && typeof specs.isCanRecover !== "function") {
        throw new Error("Provide a function for the isCanRecover in the specificaton");
    }
    let isCanRecover = specs.isCanRecover;

    // set the cannot recover event
    if (specs.onCannotRecover !== undefined && typeof specs.onCannotRecover !== "function") {
        throw new Error("Provide a function for the onCannotRecover in the specificaton");
    }
    let onCannotRecover = specs.onCannotRecover;

    // set the retry event
    if (specs.onRetry !== undefined && typeof specs.onRetry !== "function") {
        throw new Error("Provide a function for the onRetry in the specificaton");
    }
    let onRetry = specs.onRetry;

    // set the maximum retries reached
    if (specs.onMaxRetriesReached !== undefined && typeof specs.onMaxRetriesReached !== "function") {
        throw new Error("Provide a function for the onMaxRetriesReached in the specificaton");
    }
    let onMaxRetriesReached = specs.onRetry;

    // if the proise resolves, return the promise as is
    let handleSuccess = function (promise) {
        return promise;
    };

    // if the promise rejects, handle the rejection
    let handleError = function (promise) {
        return function (err) {

            // check for the recovery if specified
            if (typeof specs.isCanRecover === "function") {

                // execute the recovery check if available
                if (isCanRecover && isCanRecover(err) === false) {

                    // execute the cannot recover event if available
                    if (onCannotRecover !== undefined) {
                        onCannotRecover(err);
                    }
                    return promise;
                }
            }

            // return the promise if the maximum retries have been reached
            if (retryCount >= maxRetries) {
                if (onMaxRetriesReached !== undefined) {
                    onMaxRetriesReached({
                        error: err,
                        retryCount: retryCount
                    });
                }
                return promise;
            }

            // increase the retry counter
            retryCount += 1;

            // calculate the time to wait
            let waitTime = (Math.pow(2, retryCount) * baseWaitTime) + (Math.round(Math.random() * baseWaitTime));

            // execute the retry event if available
            if (onRetry !== undefined) {
                onRetry({
                    error: err,
                    retryCount: retryCount,
                    waitTime: waitTime
                });
            }

            // execute the backoff
            setTimeout(function () {
                return backoff(promise);
            }, waitTime);
        };
    };

    backoff = function (promise) {
        return promise()
            .then(handleSuccess)
            .catch(handleError(promise));
    };

    return {
        backoff: backoff
    };
}

module.exports = gcpApiBackoff;