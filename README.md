# gcp-api-backoff
Google Cloud Platform API backoff
=========

No dependencies back-off for the Google Cloud Platform 

## Installation

  `npm install gsp-api-backoff`

## Usage

    let backoff = gcpApiBackoff({
        isCanRecover: isCanRecover,
        onCannotRecover: onCannotRecover,
        onRetry: onRetry,
        onMaxRetriesReached: onMaxRetriesReached,
        maxRetries: 3,
        baseWaitTime: 500 
    }).backoff;

## Tests

  None yet

## Contributing

In lieu of a formal style guide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code.
