import TestAppFactory from "./test-app-factory"
import { describe } from "vitest"

type TestCallback = (factory: TestAppFactory) => void | Promise<void>

export function describeTestCase(name: string, testCallback: TestCallback) {
  const appFactory = new TestAppFactory()

  return describe(name, () => {
    beforeAll(async () => {
      await appFactory.initialize()
    })

    afterAll(async () => {
      await appFactory.dispose()
    })

    beforeEach(async () => {
      await appFactory.reset()
    })

    testCallback(appFactory)
  })
}
