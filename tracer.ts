import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus';
import { MeterProvider, PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { OTLPMetricExporter} from '@opentelemetry/exporter-metrics-otlp-proto';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';


function start(serviceName: string) {

    // Prometheus
    const { endpoint, port } = PrometheusExporter.DEFAULT_OPTIONS; 
    // const exporter = new PrometheusExporter({}, () => {
    //     console.log(
    //       `prometheus scrape endpoint: http://localhost:${port}${endpoint}`,
    //     );
    //   });
    const meterProvider = new MeterProvider({
            resource: new Resource({
            [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
        }),
    });    
    const metricReader = new PeriodicExportingMetricReader({
        exporter: new OTLPMetricExporter({
            url:'http://collector:4318/v1/metrics'
        })
    })
    meterProvider.addMetricReader(metricReader);
    const meter = meterProvider.getMeter('my-service-meter');


    // Jaeger
    const traceExporter = new OTLPTraceExporter({
        url: 'http://collector:4318/v1/traces',
    });

    const sdk = new NodeSDK({
        traceExporter,
        serviceName:serviceName,
        instrumentations: [getNodeAutoInstrumentations()]
    });


    sdk.start();

    return meter;
}

export default start