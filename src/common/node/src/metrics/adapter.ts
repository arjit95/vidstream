import { Client } from '@elastic/elasticsearch';

let instance: Client;

export async function getInstance(): Promise<Client> {
  if (instance) {
    return instance;
  }

  const svcAddr =
    process.env.CONFIG_ELASTICSEARCH_SCHEME +
    '://' +
    process.env.CONFIG_ELASTICSEARCH_HOST +
    ':' +
    process.env.CONFIG_ELASTICSEARCH_PORT;
  instance = new Client({
    node: svcAddr,
  });

  return instance;
}
