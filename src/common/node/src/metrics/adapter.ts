import { Client } from '@elastic/elasticsearch';

let instance: Client;

export async function getInstance(): Promise<Client> {
  if (instance) {
    return instance;
  }

  instance = new Client({
    node: process.env.CONFIG_ELASTICSEARCH_SERVICE,
  });

  return instance;
}
