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
 * Builds a matcher function based on a set of patterns.
 * @param patterns An array of [predicate, key] tuples. The first matching predicate determines the key.
 * @returns A function that accepts an actions object and returns the final execution function.
 */
function buildMatcher<TValue, TKey extends string | symbol | number>(
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
const partnerMatcher = buildMatcher<string, PartnerType>([
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

// --- Example without Enums (Using String Literals) ---

// Define string literal type for keys
type RangeCategory = "low" | "medium" | "high" | "out-of-bounds"

// Step 1: Create matcher with number patterns and string keys
const numberRangeMatcher = buildMatcher<number, RangeCategory>([
  [(n) => n >= 0 && n < 10, "low"],
  [(n) => n >= 10 && n < 100, "medium"],
  [(n) => n >= 100, "high"],
  // Fallback for negative or other numbers
  [() => true, "out-of-bounds"],
])

// Step 2: Define actions using string keys
const numberCategorizer = numberRangeMatcher<string>({
  // Action keys must match the string literals defined in RangeCategory
  low: (num) => `Number ${num} is in the low range.`,
  medium: (num) => `Number ${num} is in the medium range.`,
  high: (num) => `Number ${num} is in the high range.`,
  "out-of-bounds": (num) => `Number ${num} is out of defined bounds.`,
})

// Step 3: Execute the final function
console.log("\n--- Number Range Example ---")
console.log(numberCategorizer(5)) // Output: Number 5 is in the low range.
console.log(numberCategorizer(50)) // Output: Number 50 is in the medium range.
console.log(numberCategorizer(150)) // Output: Number 150 is in the high range.
console.log(numberCategorizer(-1)) // Output: Number -1 is out of defined bounds.

// --- Example with Object Value ---

// Define the object type
interface UserData {
  role: "guest" | "member" | "admin"
  isActive: boolean
}

// Define keys for the match result
type UserStatus =
  | "ActiveAdmin"
  | "InactiveAdmin"
  | "ActiveMember"
  | "Guest"
  | "OtherInactive"

// Step 1: Create matcher using UserData properties
const userStatusMatcher = buildMatcher<UserData, UserStatus>([
  // Predicates access properties of the UserData object (user)
  [(user) => user.role === "admin" && user.isActive, "ActiveAdmin"],
  [(user) => user.role === "admin" && !user.isActive, "InactiveAdmin"],
  [(user) => user.role === "member" && user.isActive, "ActiveMember"],
  [(user) => user.role === "guest", "Guest"], // Guests are guests regardless of active status in this example
  // Fallback for any other inactive user (e.g., inactive member)
  [() => true, "OtherInactive"],
])

// Step 2: Define actions for user statuses
const userStatusNotifier = userStatusMatcher<void>({
  // Action functions receive the full UserData object
  ActiveAdmin: (user) =>
    console.log(`Notifying Active Admin ${JSON.stringify(user)}`),
  InactiveAdmin: (user) =>
    console.log(`Logging Inactive Admin ${JSON.stringify(user)}`),
  ActiveMember: (user) =>
    console.log(`Welcoming Active Member ${JSON.stringify(user)}`),
  Guest: (user) =>
    console.log(`Showing Guest Page for ${JSON.stringify(user)}`),
  OtherInactive: (user) =>
    console.log(`Handling Other Inactive User ${JSON.stringify(user)}`),
})

// Step 3: Execute with different UserData objects
console.log("\n--- User Status Example ---")
const user1: UserData = { role: "admin", isActive: true }
const user2: UserData = { role: "admin", isActive: false }
const user3: UserData = { role: "member", isActive: true }
const user4: UserData = { role: "member", isActive: false }
const user5: UserData = { role: "guest", isActive: true } // isActive doesn't matter for guest pattern

userStatusNotifier(user1) // Output: Notifying Active Admin {"role":"admin","isActive":true}
userStatusNotifier(user2) // Output: Logging Inactive Admin {"role":"admin","isActive":false}
userStatusNotifier(user3) // Output: Welcoming Active Member {"role":"member","isActive":true}
userStatusNotifier(user4) // Output: Handling Other Inactive User {"role":"member","isActive":false}
userStatusNotifier(user5) // Output: Showing Guest Page for {"role":"guest","isActive":true}
