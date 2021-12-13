
export const logInfo = (message: string, context: string, data?: any) => {
    console.info({
        message, logLevel: 'INFO', context, data
    })
}

export const logAudit = (message: string, context: string, data?: any) => {
    console.info({
        message, logLevel: 'AUDIT', context, data
    })
}

export const logWarn = (message: string, context: string, data?: any) => {
    console.info({
        message, logLevel: 'WARN', context, data
    })
}

export const logError = (message: string, context: string, data?: any) => {
    console.info({
        message, logLevel: 'ERROR', context, data
    })
}

export const logDebug = (message: string, context: string, data?: any) => {
    console.info({
        message, logLevel: 'DEBUG', context, data
    })
}
