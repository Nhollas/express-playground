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
// Action function receives only the matched value
type Actions<TValue, TKey extends string | symbol | number, TResult> = Record<
  TKey,
  (value: TValue) => TResult
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
            return action(value)
          }
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

// --- Example: Returning Different Types (e.g., objects) ---
const errorMatcher = buildMatcher<number, "NotFound" | "Forbidden" | "Other">([
  [(code) => code === 404, "NotFound"],
  [(code) => code === 403, "Forbidden"],
  [() => true, "Other"],
])

const errorResponse = errorMatcher<{ message: string; retry: boolean }>({
  NotFound: () => ({ message: "Resource not found", retry: false }),
  Forbidden: () => ({ message: "Access denied", retry: false }),
  Other: (code) => ({ message: `Error code: ${code}`, retry: true }),
})

console.log("\n--- Error Matcher Example ---")
console.log(errorResponse(404)) // { message: "Resource not found", retry: false }
console.log(errorResponse(403)) // { message: "Access denied", retry: false }
console.log(errorResponse(500)) // { message: `Error code: 500`, retry: true }

// --- Example: Composing Matchers ---
const isEven = (n: number) => n % 2 === 0
const isPositive = (n: number) => n > 0

const evenOddMatcher = buildMatcher<number, "Even" | "Odd">([
  [isEven, "Even"],
  [() => true, "Odd"],
])

const signMatcher = buildMatcher<number, "Positive" | "Negative" | "Zero">([
  [isPositive, "Positive"],
  [(n) => n < 0, "Negative"],
  [() => true, "Zero"],
])

function describeNumber(n: number) {
  const evenOdd = evenOddMatcher<string>({
    Even: () => "even",
    Odd: () => "odd",
  })(n)
  const sign = signMatcher<string>({
    Positive: () => "positive",
    Negative: () => "negative",
    Zero: () => "zero",
  })(n)
  return `Number ${n} is ${sign} and ${evenOdd}.`
}

console.log("\n--- Composed Matcher Example ---")
console.log(describeNumber(4)) // Number 4 is positive and even.
console.log(describeNumber(-3)) // Number -3 is negative and odd.
console.log(describeNumber(0)) // Number 0 is zero and even.

// --- Example: Dynamic Patterns ---
function makeRoleMatcher(roles: string[]) {
  return buildMatcher<string, "Known" | "Unknown">([
    [(role) => roles.includes(role), "Known"],
    [() => true, "Unknown"],
  ])
}
const dynamicRoleMatcher = makeRoleMatcher(["admin", "user", "guest"])
const roleResult = dynamicRoleMatcher<string>({
  Known: (role) => `Role ${role} is recognized.`,
  Unknown: (role) => `Role ${role} is not recognized.`,
})

console.log("\n--- Dynamic Pattern Example ---")
console.log(roleResult("admin")) // Role admin is recognized.
console.log(roleResult("hacker")) // Role hacker is not recognized.

// --- Example: Exhaustiveness Checking ---
// Uncommenting the following will cause a TypeScript error if a key is missing
/*
const incompleteMatcher = buildMatcher<number, "A" | "B">([
  [(n) => n === 1, "A"],
  [() => true, "B"],
])
const incompleteActions = incompleteMatcher<string>({
  A: () => "A",
  // B: () => "B", // TypeScript will error if this is missing
})
*/
