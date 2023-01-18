import { Builder, Parser } from 'xml2js';

export class XmlSerialization {
  public xmlSerialize(rootName: string, value: unknown): string {
    const builder = new Builder();
    return builder.buildObject({ [rootName]: value });
  }

  public async xmlDeserialize(
    rootName: string,
    xmlString: string
  ): Promise<any> {
    const parser = new Parser({ explicitArray: false });
    return (await parser.parseStringPromise(xmlString))[rootName];
  }
}
