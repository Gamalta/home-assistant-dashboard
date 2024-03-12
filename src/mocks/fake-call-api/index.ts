export async function mockCallApi(endpoint: string): Promise<unknown> {
  return new Promise(resolve => {
    setTimeout(() => {
      return resolve({
        status: 'success',
        data: 'unknown',
      });
    }, 50);
  });
}
