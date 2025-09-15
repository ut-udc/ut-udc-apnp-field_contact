import { BlobToDataUrlPipe } from './blob-to-data-url-pipe';

describe('BlobToDataUrlPipe', () => {
  it('create an instance', () => {
    const pipe = new BlobToDataUrlPipe();
    expect(pipe).toBeTruthy();
  });
});
