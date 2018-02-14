const QueueNames = {
    EXCHANGE_RVT_TASK: 'extractRvt',
    EXCHANGE_COMPLETE_RVT: 'rvt',
    QUEUE_COMPLETE_RVT: 'completeRvt',
    QUEUE_IN_PROGRESS_RVT: 'rvtInProgress',
    QUEUE_ERROR_RVT: 'errorRvt',

    EXCHANGE_NWC_TASK: 'convertNwc',
    EXCHANGE_COMPLETE_NWC: 'nwc',
    QUEUE_COMPLETE_NWC: 'completeNwc',
    QUEUE_ERROR_NWC: 'errorNwc',
    QUEUE_IN_PROGRESS_NWC: 'nwcInProgress',
};

module.exports = QueueNames;