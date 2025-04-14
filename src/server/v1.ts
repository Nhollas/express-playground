// Example 1:

const partnerIdOne = "-1" // Admin User
const partnerIdTwo = "123456" // Partner 1
const partnerIdThree = "654321" // Partner 2
const partnerIdFour = "999999" // Partner 3 - Renamed for clarity
const partnerIdFive = "-2" // Super Admin User

// 1. Define Partner Types
enum PartnerType {
  Admin = "Admin",
  Partner1 = "Partner1",
  Partner2 = "Partner2",
  Partner3 = "Partner3",
  SuperAdmin = "SuperAdmin",
  Unknown = "Unknown", // Optional: for unmatched cases
}

// 2. Refactor Patterns to map predicates to PartnerType
const partnerPatterns: [(value: string) => boolean, PartnerType][] = [
  [(value) => value === partnerIdOne, PartnerType.Admin],
  [(value) => value === partnerIdTwo, PartnerType.Partner1],
  [(value) => value === partnerIdThree, PartnerType.Partner2],
  [(value) => value === partnerIdFour, PartnerType.Partner3],
  [(value) => value === partnerIdFive, PartnerType.SuperAdmin],
]

// 3. Create a Matcher Function
type PartnerActions<TResult = void> = Partial<
  Record<PartnerType, (partnerId: string) => TResult>
>

function matchPartner<TResult = void>(
  partnerId: string,
  actions: PartnerActions<TResult>,
  defaultValue?: TResult,
): TResult | undefined {
  for (const [predicate, type] of partnerPatterns) {
    if (predicate(partnerId)) {
      const action = actions[type]
      if (action) {
        return action(partnerId)
        // The break statement below is now unreachable because of the return,
        // but kept for clarity if the return was conditional later.
        // If the action existed, we found our match, no need to check others.
        // break; // This line is effectively achieved by the return above.
      }
      // If a predicate matches but there's no specific action defined for that type,
      // we might still want to stop checking further patterns.
      // If you want to stop even if no action is defined for the matched type, uncomment the break below.
      // break;
    }
  }
  // Execute default action if provided and no specific action was found/executed
  const defaultAction = actions[PartnerType.Unknown]
  if (defaultAction) {
    return defaultAction(partnerId)
  }
  return defaultValue
}

// --- Example Usage ---

// Example 1: Logging actions (similar to original)
const loggingActions: PartnerActions = {
  [PartnerType.Admin]: (id) => console.log(`Logging: Admin User (${id})`),
  [PartnerType.Partner1]: (id) => console.log(`Logging: Partner 1 (${id})`),
  [PartnerType.Partner2]: (id) => console.log(`Logging: Partner 2 (${id})`),
  [PartnerType.Partner3]: (id) => console.log(`Logging: Partner 3 (${id})`),
  [PartnerType.SuperAdmin]: (id) =>
    console.log(`Logging: Super Admin User (${id})`),
  [PartnerType.Unknown]: (id) =>
    console.log(`Logging: Unknown Partner (${id})`),
}

console.log("--- Logging Example ---")
matchPartner(partnerIdOne, loggingActions) // Output: Logging: Admin User (-1)
matchPartner(partnerIdFour, loggingActions) // Output: Logging: Partner 3 (999999)
matchPartner("other", loggingActions) // Output: Logging: Unknown Partner (other)

// Example 2: Getting product visibility scope
type VisibilityScope = "own" | "all"

const productVisibilityActions: PartnerActions<VisibilityScope> = {
  [PartnerType.Admin]: () => "all",
  [PartnerType.SuperAdmin]: () => "all",
  [PartnerType.Partner1]: () => "own",
  [PartnerType.Partner2]: () => "own",
  [PartnerType.Partner3]: () => "own",
  // Default for unknown or unhandled partner types
  [PartnerType.Unknown]: () => "own",
}

console.log("\n--- Product Visibility Example ---")
const scope1 = matchPartner(partnerIdTwo, productVisibilityActions)
console.log(`Partner ${partnerIdTwo} scope: ${scope1}`) // Output: Partner 123456 scope: own

const scope2 = matchPartner(partnerIdFive, productVisibilityActions)
console.log(`Partner ${partnerIdFive} scope: ${scope2}`) // Output: Partner -2 scope: all

const scope3 = matchPartner("unknown_id", productVisibilityActions, "own") // Providing explicit default
console.log(`Partner unknown_id scope: ${scope3}`) // Output: Partner unknown_id scope: own

// Example 3: Shape reporting actions (demonstrating another reusable action set)
const shapeReportingActions: PartnerActions = {
  [PartnerType.Admin]: (id) => console.log(`Shape: Admin User (${id})`),
  [PartnerType.Partner1]: (id) => console.log(`Shape: Partner 1 (${id})`),
  [PartnerType.Partner2]: (id) => console.log(`Shape: Partner 2 (${id})`),
  [PartnerType.Partner3]: (id) => console.log(`Shape: Partner 3 (${id})`),
  [PartnerType.SuperAdmin]: (id) =>
    console.log(`Shape: Super Admin User (${id})`),
  [PartnerType.Unknown]: (id) => console.log(`Shape: Unknown Partner (${id})`),
}

console.log("\n--- Shape Reporting Example ---")
matchPartner(partnerIdOne, shapeReportingActions) // Output: Shape: Admin User (-1)
matchPartner(partnerIdTwo, shapeReportingActions) // Output: Shape: Partner 1 (123456)

const shapeReport = (partnerId: string) =>
  matchPartner(partnerId, shapeReportingActions)
