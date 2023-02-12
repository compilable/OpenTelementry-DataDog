import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { FetchInstrumentation } from '@opentelemetry/instrumentation-fetch';
import { ZoneContextManager } from '@opentelemetry/context-zone';
import React from 'react';
import { DocumentLoadInstrumentation } from '@opentelemetry/instrumentation-document-load';
import {OTLPTraceExporter} from '@opentelemetry/exporter-trace-otlp-http';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { UserInteractionInstrumentation } from '@opentelemetry/instrumentation-user-interaction';
import { Resource } from '@opentelemetry/resources';

const collectorUrl = 'http://otel-collector:4317/v1/traces';

const collectorOptions = {
    url: collectorUrl, // url is optional and can be omitted - default is http://localhost:4318/v1/traces
    headers: {}, // an optional object containing custom headers to be sent with each request
    concurrencyLimit: 10 // an optional limit on pending requests
};

const resource = new Resource({ 'service.name': 'app-unique-id' });
const exporter = new OTLPTraceExporter({});//collectorOptions
const provider = new WebTracerProvider({ resource });
provider.addSpanProcessor(new BatchSpanProcessor(exporter, {
    // The maximum queue size. After the size is reached spans are dropped.
    maxQueueSize: 100,
    // The maximum batch size of every export. It must be smaller or equal to maxQueueSize.
    maxExportBatchSize: 10,
    // The interval between two consecutive exports
    scheduledDelayMillis: 500,
    // How long the export can run before it is cancelled
    exportTimeoutMillis: 30000
}));

provider.register({
    contextManager: new ZoneContextManager()  // Zone is required to keep async calls in the same trace
});

const fetchInstrumentation = new FetchInstrumentation({});
fetchInstrumentation.setTracerProvider(provider);

// Registering instrumentations
registerInstrumentations({
    instrumentations: [
        new DocumentLoadInstrumentation(),
        new UserInteractionInstrumentation(),
        new FetchInstrumentation()
    ]
});

export default function TraceProvider({ children }:any) {
    return (
        <>
            {children}
        </>
    );
}