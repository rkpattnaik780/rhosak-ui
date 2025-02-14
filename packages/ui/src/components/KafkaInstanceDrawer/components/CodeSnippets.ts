export const javaConfigCodeBlock = (
  kafkaBootstrapUrl: string,
  tokenEndpointUrl: string
) => {
  return `package org.example;
import org.apache.kafka.clients.producer.ProducerConfig;  
import java.util.Properties;
    
public class KafkaConfig {
    
    static Properties properties() {
    
        String kafkaHost = "${kafkaBootstrapUrl}";
        String rhoasClientID = "<client_id>";
        String rhoasClientSecret = "<client_secret>";
        String rhoasOauthTokenUrl = "${tokenEndpointUrl}";`;
};

export const javaConfigExpandabledBlock = `
        var properties= new Properties();

        properties.setProperty(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, kafkaHost);
        properties.setProperty("security.protocol", "SASL_SSL");
        properties.setProperty("sasl.mechanism", "OAUTHBEARER");

        properties.setProperty("sasl.jaas.config", "org.apache.kafka.common.security.oauthbearer.OAuthBearerLoginModule required clientId=\\"" + rhoasClientID + "\\" clientSecret=\\"" + rhoasClientSecret + "\\" oauth.token.endpoint.uri=\\"" + rhoasOauthTokenUrl + "\\";");

        properties.setProperty("sasl.login.callback.handler.class", "org.apache.kafka.common.security.oauthbearer.secured.OAuthBearerLoginCallbackHandler");
        properties.setProperty("sasl.oauthbearer.token.endpoint.url", rhoasOauthTokenUrl);
        properties.setProperty("sasl.oauthbearer.scope.claim.name", "api.iam.service_accounts");

        return properties;
    }
}`;

export const javaProducerCodeBlock = `package org.example;
 
import org.apache.kafka.clients.producer.ProducerConfig;
import org.apache.kafka.clients.producer.ProducerRecord;
import org.apache.kafka.clients.producer.KafkaProducer;
import org.apache.kafka.common.serialization.StringSerializer;
 
public class ProducerExample {
 
   public static void main(String[] args) {`;

export const javaProducerExpandableBlock = `
   //Creating producer properties
   var properties= KafkaConfig.properties();
   properties.setProperty(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class.getName());
   properties.setProperty(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, StringSerializer.class.getName());

   KafkaProducer<String,String> producer= new KafkaProducer<String,String>(properties);

   producer.send(new ProducerRecord<>(<"topic">, "Test Message"));
   producer.flush();
   producer.close();
  }
}`;

export const javaConsumerCodeBlock = `package org.example;
 
import java.util.Arrays;

import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.clients.consumer.KafkaConsumer;
import org.apache.kafka.common.serialization.StringDeserializer;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.clients.consumer.ConsumerRecords;
import java.time.Duration;`;

export const javaConsumerExpandableBlock = `
public class ConsumerExample {

    public static void main(String[] args) {

        var properties= KafkaConfig.properties();

        properties.setProperty(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class.getName());
        properties.setProperty(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class.getName());
        properties.setProperty(ConsumerConfig.GROUP_ID_CONFIG,"test_group_2");
        properties.setProperty(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "earliest");

        KafkaConsumer<String,String> consumer = new KafkaConsumer<String,String>(properties);

        //Subscribing
        consumer.subscribe(Arrays.asList("<topic>"));

        //polling
        while(true){
            ConsumerRecords<String,String> records=consumer.poll(Duration.ofMillis(100));
            for(ConsumerRecord<String,String> record: records) {
                System.out.println("Key: "+ record.key() + ", Value:" +record.value());
                System.out.println("Partition:" + record.partition()+",Offset:"+record.offset());
            }
        }
    }
}`;

export const pythonConfigCodeBlock = (tokenEndpointUrl: string) => {
  return `import time
import requests
    
def _get_token(config):
    payload = {"grant_type": "client_credentials", "scope": "api.iam.service_accounts"}
    resp = requests.post(
        "${tokenEndpointUrl}",
        auth=(
            <client_id>,
            <client_secret>,
        ),
        data=payload,
    )`;
};

export const pythonConfigExpandabledBlock = (kafkaBootstrapUrl: string) => {
  return `
    token = resp.json()
    return token["access_token"], time.time() + float(token["expires_in"])
    
    common_config = {
    'bootstrap.servers': "${kafkaBootstrapUrl}",
    'security.protocol': 'SASL_SSL',
    'sasl.mechanisms': 'OAUTHBEARER',
    'oauth_cb': _get_token,
    }
    
    topic=<topic>`;
};

export const pythonProducer = `from confluent_kafka import Producer
 
producer = Producer(common_config)
 
producer.produce(topic=<topic>, value=b"Sample Message")
producer.flush()`;

export const pythonConsumerCodeBlock = `from confluent_kafka import Consumer
 
consumer_config = {
    "group.id": "test-group",
    'session.timeout.ms': 6000,
    'auto.offset.reset': 'earliest',
}

consumer = Consumer({ **consumer_config, **common_config })

consumer.subscribe([<topic>])`;

export const pythonConsumerExpandableBlock = `while True:
try:
    msg = consumer.poll(1.0)
    if msg is None:
        continue

    print(msg.value())
except KeyboardInterrupt:
    break

consumer.close()`;

export const quarkusConfigCodeBlock = `# Quarkus config
quarkus.ssl.native=true

# Configure the Kafka sink (we write to it)
mp.messaging.outgoing.generated-price.connector=smallrye-kafka
mp.messaging.outgoing.generated-price.topic=<topic>
mp.messaging.outgoing.generated-price.value.serializer=org.apache.kafka.common.serialization.IntegerSerializer

# Configure the Kafka source (we read from it)
mp.messaging.incoming.prices.connector=smallrye-kafka
mp.messaging.incoming.prices.topic=<topic>
mp.messaging.incoming.prices.value.deserializer=org.apache.kafka.common.serialization.IntegerDeserializer`;

export const quarkusConfigExpandableBlock = (
  kafkaBootstrapUrl: string,
  tokenEndpointUrl: string
) => {
  return `
# Configure docker config
quarkus.container-image.builder=jib
quarkus.kubernetes.deployment-target=kubernetes
quarkus.container-image.build=false
quarkus.container-image.push=false
    
## dev profile using user defined environment variables that uses SASL/OAUTHBEARER
## ./mvnw quarkus:dev
## ./mvnw package -Dquarkus.profile=dev
    
%dev.kafka.bootstrap.servers=\${"${kafkaBootstrapUrl}"}
%dev.kafka.security.protocol=SASL_SSL
    
%dev.kafka.sasl.mechanism=OAUTHBEARER
%dev.kafka.sasl.jaas.config=org.apache.kafka.common.security.oauthbearer.OAuthBearerLoginModule required \\
    oauth.client.id="\${<client_id>}" \\
    oauth.client.secret="\${<client_secret>}" \\
    oauth.token.endpoint.uri="\${"${tokenEndpointUrl}"}" ;
%dev.kafka.sasl.login.callback.handler.class=io.strimzi.kafka.oauth.client.JaasClientOauthLoginCallbackHandler`;
};

export const quarkusProducerCodeBlock = `package org.acme.kafka;
import java.time.Duration;
import java.util.Random;

import javax.enterprise.context.ApplicationScoped;

import io.smallrye.mutiny.Multi;
import org.eclipse.microprofile.reactive.messaging.Outgoing;`;

export const quarkusProducerExpandableBlock = `
/**
* A bean producing random prices every 5 seconds.
* The prices are written to a Kafka topic (prices). The Kafka configuration is specified in the application configuration.
*/
@ApplicationScoped
public class PriceGenerator {

   private Random random = new Random();

   @Outgoing("generated-price")
   public Multi<Integer> generate() {
       return Multi.createFrom().ticks().every(Duration.ofSeconds(5))
               .onOverflow().drop()
               .map(tick -> random.nextInt(100));
   }

}`;

export const quarkusConsumerCodeBlock = `package org.acme.kafka;
import javax.enterprise.context.ApplicationScoped;

import org.eclipse.microprofile.reactive.messaging.Acknowledgment;
import org.eclipse.microprofile.reactive.messaging.Incoming;
import org.eclipse.microprofile.reactive.messaging.Outgoing;

import io.smallrye.reactive.messaging.annotations.Broadcast;

/**
 * A bean consuming data from the "prices" Kafka topic and applying some conversion.
 * The result is pushed to the "my-data-stream" stream which is an in-memory stream.
 */
@ApplicationScoped`;

export const quarkusConsumerExpandableBlock = `public class PriceConverter {

    private static final double CONVERSION_RATE = 0.88;

    // Consume from the \`prices\` channel and produce to the \`my-data-stream\` channel
    @Incoming("prices")
    @Outgoing("my-data-stream")
    // Send to all subscribers
    @Broadcast
    // Acknowledge the messages before calling this method.
    @Acknowledgment(Acknowledgment.Strategy.PRE_PROCESSING)
    public double process(int priceInUsd) {
        return priceInUsd * CONVERSION_RATE;
    }

}`;

export const springBootConfigCodeBlock = (
  kafkaBootstrapUrl: string,
  tokenEndpointUrl: string
) => {
  return `package com.example.kafkaconfig;
import java.util.HashMap;
import java.util.Map;

public class KafkaConfig {

   public static Map<String, Object> Config() {

       Map<String, Object> config = new HashMap<>();

       String kafkaHost = "${kafkaBootstrapUrl}";
       String rhoasClientID = "<client_id>";
       String rhoasClientSecret = "<client_secret>";
       String rhoasOauthTokenUrl = "${tokenEndpointUrl}";`;
};

export const springBootConfigExpandableBlock = `
    config.put("bootstrap.servers", kafkaHost);

    config.put("security.protocol", "SASL_SSL");
    config.put("sasl.mechanism", "OAUTHBEARER");

    config.put("sasl.jaas.config", "org.apache.kafka.common.security.oauthbearer.OAuthBearerLoginModule required clientId=\\"" + rhoasClientID + "\\" clientSecret=\\"" + rhoasClientSecret + "\\" oauth.token.endpoint.uri=\\"" + rhoasOauthTokenUrl + "\\";");
    config.put("sasl.login.callback.handler.class", "org.apache.kafka.common.security.oauthbearer.secured.OAuthBearerLoginCallbackHandler");
    config.put("sasl.oauthbearer.token.endpoint.url", rhoasOauthTokenUrl);
    config.put("sasl.oauthbearer.scope.claim.name", "api.iam.service_accounts");

    return config;
   }
}`;

export const springBootProducerCodeBlock = `package com.example.kafkademo;
import org.apache.kafka.clients.producer.ProducerConfig;
import org.apache.kafka.common.serialization.StringSerializer;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.kafka.core.DefaultKafkaProducerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.core.ProducerFactory;
import com.example.kafkaconfig.KafkaConfig;

import java.util.Map;`;

export const springBootProducerExpandableBlock = `
@SpringBootApplication
public class KafkaProducerExample implements CommandLineRunner {

  public static void main(String[] args) throws Exception {
    SpringApplication.run(KafkaProducerExample.class, args);

    SpringApplication app = new SpringApplication(KafkaProducerExample.class);

    app.run(args);
  }


  //access command line arguments
  @Override
  public void run(String... args) throws Exception {

    System.exit(0);

  }

  @Bean
  public ProducerFactory<String, String> producerFactory() {
    Map<String, Object> config = KafkaConfig.Config();

    config.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class);
    config.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, StringSerializer.class);

    return new DefaultKafkaProducerFactory<String, String>(config);
  }

  @Bean
  public KafkaTemplate<String, String> kafkaTemplate() {
    return new KafkaTemplate<>(producerFactory());
  }

  @Bean
  public ApplicationRunner runner(KafkaTemplate<String, String> template) {
    return args -> {
      template.send(<"topic">, "Test Message");
    };
  }

}`;

export const springBootListenerCodeBlock = `package com.example.kafkaconsumer.listener;

import com.example.kafkaconfig.KafkaConfig;
import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.common.serialization.StringDeserializer;
import org.springframework.context.annotation.Bean;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.config.ConcurrentKafkaListenerContainerFactory;
import org.springframework.kafka.core.ConsumerFactory;
import org.springframework.kafka.core.DefaultKafkaConsumerFactory;
import org.springframework.stereotype.Component;

import java.util.Map;`;

export const springBootListenerExpandableBlock = `@Component
public class Listener {

    @KafkaListener(topics = <"topic">,
            containerFactory = "concurrentKafkaListenerContainerFactory",
            groupId = "group_id")

    // Method
    public void consume(String message)
    {
        // Print statement
        System.out.println(message);
    }
}`;

export const springBootConsumerConfigCodeBlock = `package com.example.kafkaconsumer.config;

import java.util.HashMap;
import java.util.Map;

import com.example.kafkaconfig.KafkaConfig;
import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.common.serialization.StringDeserializer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.annotation.EnableKafka;
import org.springframework.kafka.core.ConsumerFactory;
import org.springframework.kafka.core.DefaultKafkaConsumerFactory;
import org.springframework.kafka.config.ConcurrentKafkaListenerContainerFactory;`;

export const springBootConsumerConfigExpandableBlock = `// Annotations
@EnableKafka
@Configuration

public class KafkaConsumerConfig {

    @Bean
    public ConsumerFactory<String, String> consumerFactory() {
        Map<String, Object> config = KafkaConfig.Config();

        config.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class);
        config.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class);

        return new DefaultKafkaConsumerFactory<>(config);
    }

    @Bean
    public ConcurrentKafkaListenerContainerFactory concurrentKafkaListenerContainerFactory() {
        ConcurrentKafkaListenerContainerFactory<
                String, String> factory
                = new ConcurrentKafkaListenerContainerFactory<>();
        factory.setConsumerFactory(consumerFactory());
        return factory;
    }
}`;

export const springBootConsumerExampleCodeBlock = `
package com.example.kafkaconsumer;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;`;

export const springBootConsumerExampleExpandableBlock = `
@SpringBootApplication
public class KafkaConsumerExample implements CommandLineRunner {

    public static void main(String[] args) {
        SpringApplication.run(KafkaConsumerExample.class, args);
    }

    @Override
    public void run(String... args) throws Exception {

       System.exit(0);

    }

}`;
