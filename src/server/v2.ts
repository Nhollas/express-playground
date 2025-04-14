// Example Data
const adminPartnerId = "-1" // Admin User
const superAdminPartnerId = "-2" // Super Admin User

// 1. Define Keys (Using Enum for type safety and clarity)
enum PartnerType {
  Admin = "Admin",
  SuperAdmin = "SuperAdmin",
  Unknown = "Unknown",
}

// --- Generic Matcher Implementation ---

// Type for a single pattern: predicate function and associated key
type Pattern<TValue, TKey extends string | symbol | number> = [
  (value: TValue) => boolean,
  TKey,
]

// Type for the actions object: maps keys to action functions
// Action function receives the matched value and the specific key
type Actions<TValue, TKey extends string | symbol | number, TResult> = Record<
  TKey,
  (value: TValue, key: TKey) => TResult
>

/**
 * Creates a matcher function based on a set of patterns.
 * @param patterns An array of [predicate, key] tuples. The first matching predicate determines the key.
 * @returns A function that accepts an actions object and returns the final execution function.
 */
function createMatcher<TValue, TKey extends string | symbol | number>(
  patterns: Pattern<TValue, TKey>[],
) {
  /**
   * Accepts an actions object mapping keys to functions.
   * @param actions An object where keys match those in the patterns, and values are action functions.
   * @returns A function that takes a value and executes the matched action.
   */
  return function <TResult>(actions: Actions<TValue, TKey, TResult>) {
    /**
     * Executes the match logic for a given value.
     * @param value The value to match against the patterns.
     * @returns The result of the executed action corresponding to the first matching pattern.
     */
    return function (value: TValue): TResult | undefined {
      for (const [predicate, key] of patterns) {
        if (predicate(value)) {
          const action = actions[key]
          if (action) {
            // Execute the action associated with the matched key
            return action(value, key)
          }
          break // Found the first matching pattern, stop searching
        }
      }
      return undefined
    }
  }
}

// --- Example Usage ---

// Step 1: Create a matcher instance with specific patterns
const partnerMatcher = createMatcher<string, PartnerType>([
  [(value) => value === adminPartnerId, PartnerType.Admin],
  [(value) => value === superAdminPartnerId, PartnerType.SuperAdmin],
  // Default/fallback pattern - must come last
  [() => true, PartnerType.Unknown],
])

// Step 2: Define an action set and apply it to the matcher
const partnerLog = partnerMatcher<void>({
  // Actions object must provide functions for all keys defined in PartnerType
  [PartnerType.Admin]: (id) => console.log(`Logging: Admin User (${id})`),
  [PartnerType.SuperAdmin]: (id) =>
    console.log(`Logging: Super Admin User (${id})`),
  [PartnerType.Unknown]: (id) =>
    console.log(`Logging: Unknown Partner (${id})`),
})

// Step 3: Execute the final function with a value
console.log("--- Logging Example ---")
partnerLog(adminPartnerId) // Output: Logging: Admin User (-1)
partnerLog(superAdminPartnerId) // Output: Logging: Super Admin User (-2)
partnerLog("someOtherId") // Output: Logging: Unknown Partner (someOtherId)

// Another example: Getting a description string
const partnerDescription = partnerMatcher<string>({
  [PartnerType.Admin]: (id) => `User ${id} is an Admin.`,
  [PartnerType.SuperAdmin]: (id) => `User ${id} is a Super Admin.`,
  [PartnerType.Unknown]: (id) => `User ${id} is a standard partner.`,
})

console.log("\n--- Description Example ---")
console.log(partnerDescription(adminPartnerId)) // Output: User -1 is an Admin.
console.log(partnerDescription("yetAnotherId")) // Output: User yetAnotherId is a standard partner.
