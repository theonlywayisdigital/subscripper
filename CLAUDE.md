# Subscripper

Local subscription marketplace connecting UK businesses (coffee shops, bakeries, lunch spots) with customers through recurring subscription offerings.

## Quick Start

```bash
cd subscripper
npm install
npx expo start
```

Scan the QR code with Expo Go on your phone.

**Tunnel mode (recommended):** `npx expo start --tunnel`

## Current Development State

**Stage:** Stage 3 In Progress (Business Onboarding)

**Dev Bypass:** Set `EXPO_PUBLIC_DEV_BYPASS_AUTH=true` in `.env` to bypass auth for UI development.
- Creates a mock customer user for testing
- Change `userType` in `stores/auth.ts` DEV_MOCK_USER to test different user flows
- **SET TO FALSE FOR PRODUCTION**

**Completed Work:**
- Stage 1: Foundation (Tamagui, Supabase client, Expo Router, base components, Zustand)
- Stage 1.5: UI Mockups (Customer Home, Loyalty, Tab bar)
- Stage 2: Authentication & Users
  - Supabase Auth integration with profiles table
  - Login/Register screens wired to Supabase
  - Profile photo upload to Supabase Storage
  - Edit Profile screen
  - Role-based navigation guards

**Stage 3 Progress:**
- Businesses database schema (run `supabase/migrations/002_businesses.sql`)
- Business onboarding wizard (5-step flow)
- Business dashboard with status handling
- Admin approval queue with approve/reject
- Staff invitation system

**Next Up:** Stage 3 completion (Stripe Connect) then Stage 4

**Before Testing Auth:**
1. Run the SQL in `supabase/migrations/001_profiles.sql` in your Supabase dashboard
2. Set `EXPO_PUBLIC_DEV_BYPASS_AUTH=false` in `.env`
3. Restart the app

## ⚠️ SECURITY FIXES BEFORE PRODUCTION

These are disabled for development and MUST be fixed before launch:

- [ ] **Re-enable RLS on profiles table** - Currently disabled. Run: `alter table public.profiles enable row level security;` and fix policies
- [ ] **Re-enable email confirmation** - Currently disabled in Supabase Auth settings
- [ ] **Remove DEV_BYPASS_AUTH** - Set to false or remove entirely
- [ ] **Review all RLS policies** - Current policies cause infinite recursion, need to redesign

## Tech Stack

- **Frontend**: React Native + Expo SDK 54
- **UI**: Tamagui (with CSS animations - avoids react-native-reanimated issues)
- **Navigation**: Expo Router (file-based)
- **Backend**: Supabase (auth, database, storage, realtime)
- **Payments**: Stripe Connect Express
- **State**: Zustand (with persist middleware + AsyncStorage)
- **Language**: TypeScript (strict mode)

## Project Structure

```
/subscripper
  /app                      -- Expo Router pages (file-based routing)
    /(auth)                 -- Login, register screens
    /(customer)             -- Customer app screens
    /(business)             -- Business owner screens
    /(staff)                -- Staff screens
    /(admin)                -- Admin screens
    _layout.tsx             -- Root layout with providers
  /components
    /ui                     -- Base UI components (Button, Card, Input, etc.)
    /forms                  -- Form components
    /layouts                -- Layout wrappers
    /navigation             -- Navigation components
    /features               -- Feature-specific components
      /auth
      /subscription
      /loyalty
      /redemption
      /discovery
      /dashboard
  /lib
    /supabase               -- Supabase client and helpers
    /stripe                 -- Stripe integration
    /hooks                  -- Custom hooks
    /utils                  -- Utility functions
    /constants              -- App constants
    /types                  -- TypeScript types
  /stores                   -- Zustand state stores
  /assets                   -- Images, fonts
  tamagui.config.ts         -- Tamagui theme configuration
  app.config.ts             -- Expo configuration
```

## Commands

```bash
npx expo start              # Start dev server (scan QR with Expo Go)
npx expo start --web        # Web version (Business/Admin dashboards)
npx expo start --ios        # iOS simulator
npx expo start --android    # Android emulator
npm run lint                # ESLint
npm run typecheck           # TypeScript check
```

## Environment Variables

Create a `.env` file:

```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_key
```

---

## Agent System

This project uses a multi-agent development approach. Before making any decisions or writing code, consult the relevant agent(s).

### CHIEF ARCHITECT

**Invoked for:** System design, folder structure, technology choices, API design, data flow, scalability decisions

**Responsibilities:**
- Define and maintain the overall system architecture
- Ensure consistency across the codebase
- Make technology and library decisions
- Design database schema and relationships
- Plan API endpoints and data contracts
- Ensure the stack (React Native + Expo + Supabase + Stripe) works together

**Questions this agent asks:**
- Does this fit the overall architecture?
- Will this scale?
- Are we creating technical debt?
- Is this the right layer for this logic?

---

### PROJECT MANAGER

**Invoked for:** Task breakdown, prioritisation, dependencies, progress tracking, scope decisions

**Responsibilities:**
- Break large features into manageable tasks
- Identify dependencies between tasks
- Prioritise MVP features vs nice-to-haves
- Track what's been built vs what remains
- Flag scope creep
- Ensure features align with the spec

**Questions this agent asks:**
- Is this in the MVP scope?
- What needs to be built first?
- What are the dependencies?
- Are we over-engineering this?

---

### UI AGENT

**Invoked for:** Any screen, component, or UI element creation

**Responsibilities:**
- Maintain the component registry (below)
- Prevent duplicate component creation
- Ensure UI consistency across the app
- Reference the design system and colour palette
- Use Tamagui components where possible

**Before creating any UI, this agent must:**
1. Check if a similar component already exists
2. Check if an existing component can be extended
3. Reference the colour palette
4. Ensure mobile-first responsive design

---

### DESIGN AGENT

**Invoked for:** Visual design decisions, spacing, typography, animations, colour usage

**Responsibilities:**
- Enforce the brand colour palette
- Maintain visual consistency
- Define spacing and typography scales
- Specify animations and transitions
- Ensure accessibility (contrast, touch targets)

---

### CODE REVIEWER

**Invoked for:** After writing any significant code block

**Responsibilities:**
- Review code for bugs and edge cases
- Check for security vulnerabilities
- Ensure error handling is present
- Verify TypeScript types are correct
- Check for performance issues
- Ensure code follows established patterns

**Checklist:**
- [ ] Error handling present?
- [ ] Loading states handled?
- [ ] Edge cases considered?
- [ ] Types correct and complete?
- [ ] No hardcoded values that should be constants?
- [ ] Consistent with existing code patterns?
- [ ] No sensitive data exposed?
- [ ] Accessibility considered?

---

### DATABASE AGENT

**Invoked for:** Schema design, queries, migrations, Supabase configuration

**Responsibilities:**
- Design and maintain database schema
- Write efficient queries
- Set up Row Level Security (RLS) policies
- Design indexes for performance
- Handle migrations
- Ensure data integrity

**Supabase-specific:**
- Always use RLS policies for security
- Use Supabase Auth for user management
- Consider real-time subscriptions where appropriate
- Use database functions for complex operations

**Questions this agent asks:**
- Is this query efficient?
- Do we need an index?
- Are RLS policies correctly configured?
- Is the schema normalised appropriately?
- Are relationships correctly defined?

---

### COPYWRITER AGENT

**Invoked for:** Any user-facing text, error messages, notifications, onboarding copy

**Responsibilities:**
- Write clear, friendly copy in UK English
- Maintain consistent tone of voice
- Ensure messages are helpful, not robotic
- Write error messages that explain what to do
- Create onboarding and empty state copy

**Tone Guidelines:**
- Friendly and approachable, never corporate
- Clear and concise, no jargon
- Helpful, always suggest next steps
- UK English spelling (colour, favourite, organised)
- Use contractions (you're, we'll, it's)
- Positive framing where possible

**Examples:**
```
Bad:  "Error: Invalid input"
Good: "Hmm, that doesn't look right. Check your email address and try again."

Bad:  "No subscriptions found"
Good: "You haven't subscribed to anyone yet. Discover local businesses near you!"

Bad:  "Transaction successful"
Good: "You're all set! Enjoy your coffee"
```

---

### CAN THIS BE DONE BETTER AGENT

**Invoked for:** Every significant decision or implementation

**Responsibilities:**
- Challenge the first solution that comes to mind
- Suggest alternative approaches
- Question assumptions
- Identify simpler solutions
- Prevent over-engineering AND under-engineering
- Ensure best practices are followed

**This agent always asks:**
1. Is there a simpler way to do this?
2. Is there a more performant way?
3. Is there a more maintainable way?
4. Are we using the right tool for this job?
5. What would break this? How do we prevent it?
6. Is this the convention in React Native / Expo / Supabase?
7. Will future-us thank present-us for this decision?

**Red flags to catch:**
- Reinventing the wheel (use existing libraries)
- Over-abstraction too early
- Premature optimisation
- Copy-pasting code that should be shared
- Magic numbers and strings
- Ignoring TypeScript's type safety
- Not using Tamagui components when they exist

---

## Workflow

For each feature or task:

1. **PROJECT MANAGER** — Confirm this is in scope, identify dependencies
2. **CHIEF ARCHITECT** — Design the approach, identify affected systems
3. **CAN THIS BE DONE BETTER** — Challenge the approach, suggest alternatives
4. **DATABASE AGENT** — Design/update schema if needed
5. **UI AGENT** — Check for existing components, plan new ones if needed
6. **DESIGN AGENT** — Confirm visual approach matches design system
7. **Build the feature** — Write the code
8. **COPYWRITER AGENT** — Review all user-facing text
9. **CODE REVIEWER** — Review the implementation
10. **Update documentation** — Keep component registry current

---

## Design Tokens

### Colours

| Use | Colour | Hex |
|-----|--------|-----|
| Dark base / headers | Deep green | `#1A3A35` |
| Soft accent | Lilac | `#D4C8E8` |
| CTAs / success states | Lime | `#C4E538` |
| Card backgrounds | White | `#FFFFFF` |
| Main background | Off-white | `#F9FAF9` |
| Text on light | Dark green | `#1A2E28` |
| Muted text | Grey | `#666666` |
| Light text | Light grey | `#999999` |
| Error states | Red | `#E53935` |

### Usage Guidelines

- **Deep green (#1A3A35)**: Headers, navigation bars, primary buttons, dark mode backgrounds, text on lime
- **Lilac (#D4C8E8)**: Soft highlights, category tags, secondary cards, loyalty card backgrounds, avatar placeholders
- **Lime (#C4E538)**: Call-to-action buttons, swipe-to-redeem slider, success confirmations, active tab indicators, progress bars
- **Off-white (#F9FAF9)**: Main content backgrounds
- **White (#FFFFFF)**: Cards, modals, input fields

### Spacing

| Token | Value |
|-------|-------|
| xs | 4px |
| sm | 8px |
| md | 16px |
| lg | 24px |
| xl | 32px |
| xxl | 48px |

### Border Radius

| Token | Value |
|-------|-------|
| sm | 8px |
| md | 16px |
| lg | 24px |
| full | 9999px (pills/circles) |

### Typography

| Style | Size | Weight |
|-------|------|--------|
| h1 | 28px | bold |
| h2 | 24px | bold |
| h3 | 20px | semibold |
| h4 | 18px | semibold |
| body | 16px | regular |
| bodySmall | 14px | regular |
| caption | 12px | regular |

---

## Critical Rules

1. **Never create a new component without UI AGENT checking the registry first**
2. **Never write a query without DATABASE AGENT reviewing it**
3. **Never commit to an approach without CAN THIS BE DONE BETTER weighing in**
4. **All user-facing text must go through COPYWRITER AGENT**
5. **All code must be reviewed by CODE REVIEWER before moving on**
6. **Always use TypeScript strict mode — no `any` types**
7. **Always handle loading, error, and empty states**
8. **Always use the design tokens — never hardcode colours or spacing**

---

## Component Registry

Track all components as they are built. Update this list whenever a new component is created.

### /components/ui (Base Components)

| Component | Description | Props | Status |
|-----------|-------------|-------|--------|
| Button | Primary action button | variant (primary/secondary/outline/ghost/danger), size, loading, fullWidth | Complete |
| Card | Container with shadow | variant (default/elevated/outlined/filled), size, pressable | Complete |
| Input | Text input field | label, error, helperText, variant, size | Complete |
| Text | Typography component | variant (h1-caption), color (primary/muted/etc), align | Complete |
| Heading1 | H1 heading preset | inherits from Text | Complete |
| Heading2 | H2 heading preset | inherits from Text | Complete |
| Heading3 | H3 heading preset | inherits from Text | Complete |
| Paragraph | Body text preset | inherits from Text | Complete |
| Caption | Small text preset | inherits from Text | Complete |
| Label | Form label preset | inherits from Text | Complete |

### /components/forms

| Component | Description | Props | Status |
|-----------|-------------|-------|--------|
| (none yet) | | | |

### /components/layouts

| Component | Description | Props | Status |
|-----------|-------------|-------|--------|
| (none yet) | | | |

### /components/navigation

| Component | Description | Props | Status |
|-----------|-------------|-------|--------|
| TabIcon | Custom tab icon with active dot indicator | Icon, color, focused | Complete |

### /components/features

| Component | Description | Props | Status |
|-----------|-------------|-------|--------|
| (none yet) | | | |

---

## Screen Components

These are inline components defined within screen files. Consider extracting to `/components/features` if reused.

### Customer Screens

| Component | Location | Description | Status |
|-----------|----------|-------------|--------|
| SubscriptionCard | `(customer)/index.tsx` | Horizontal scroll card showing subscription status | Complete |
| CategoryPill | `(customer)/index.tsx` | Pill button for category filtering | Complete |
| BusinessCard | `(customer)/index.tsx` | Business listing with image, details, rating | Complete |
| StampCircle | `(customer)/loyalty.tsx` | Filled/unfilled/free stamp circle | Complete |
| LoyaltyCard | `(customer)/loyalty.tsx` | Full loyalty card with stamp grid | Complete |
| UpsellCard | `(customer)/loyalty.tsx` | Dark upsell prompt card | Complete |

### Auth Screens

| Screen | File | Description | Status |
|--------|------|-------------|--------|
| LoginScreen | `(auth)/login.tsx` | Email/password login form | Complete |
| RegisterScreen | `(auth)/register.tsx` | Customer/business registration form | Complete |
| EditProfileScreen | `(customer)/edit-profile.tsx` | Edit name, phone, profile picture | Complete |

### Hooks

| Hook | File | Description | Status |
|------|------|-------------|--------|
| useAuthGuard | `lib/hooks/useAuthGuard.ts` | Protects routes by auth state and user type | Complete |
| useCustomerGuard | `lib/hooks/useAuthGuard.ts` | Convenience guard for customer routes | Complete |
| useBusinessGuard | `lib/hooks/useAuthGuard.ts` | Convenience guard for business owner routes | Complete |
| useStaffGuard | `lib/hooks/useAuthGuard.ts` | Convenience guard for staff routes | Complete |
| useAdminGuard | `lib/hooks/useAuthGuard.ts` | Convenience guard for admin routes | Complete |

### Supabase Helpers

| Helper | File | Description | Status |
|--------|------|-------------|--------|
| pickImage | `lib/supabase/storage.ts` | Pick image from library with permissions | Complete |
| uploadProfilePicture | `lib/supabase/storage.ts` | Upload avatar to Supabase Storage | Complete |
| deleteProfilePicture | `lib/supabase/storage.ts` | Delete avatar from Supabase Storage | Complete |

### Business Screens

| Screen | File | Description | Status |
|--------|------|-------------|--------|
| BusinessDashboard | `(business)/index.tsx` | Stats overview with setup prompt | Placeholder |

### Staff Screens

| Screen | File | Description | Status |
|--------|------|-------------|--------|
| StaffStampsScreen | `(staff)/index.tsx` | QR scan / phone search for stamps | Placeholder |

### Admin Screens

| Screen | File | Description | Status |
|--------|------|-------------|--------|
| AdminDashboard | `(admin)/index.tsx` | Platform stats overview | Placeholder |

---

## User Types

| Type | Description | Capabilities |
|------|-------------|--------------|
| customer | End users who subscribe and redeem | Browse, subscribe, redeem, loyalty cards |
| staff | Business employees | Award stamps, view redemptions, undo |
| business_owner | Local business operators | All staff + create products, invite staff, analytics |
| admin | Platform administrators | Full system access, approvals, disputes |

---

## Key Patterns

- **Use Tamagui components**, not raw React Native
- **Supabase RLS** for all data access — never trust the client
- **UK English** spelling throughout (colour, favourite, organised)
- **Never hold funds** — Stripe handles all payment splits
- **Profile photos required** for customers (identity verification at redemption)
- **Swipe-to-redeem** with dramatic confirmation animation

---

## Database Schema

```sql
-- Users & Auth
users: id, email, name, phone, profile_picture_url, location, user_type, created_at, updated_at, deleted_at

-- Businesses
businesses: id, owner_id, name, type, address, lat, lng, email, phone, logo_url, cover_photos, description, website, social_links, opening_hours, google_place_id, google_rating, status, stripe_account_id, commission_rate, branding, created_at
business_staff: id, business_id, user_id, role, invited_at, accepted_at

-- Subscriptions
subscription_products: id, business_id, name, description, items, quantity_per_period, period, price_gbp, blackout_times, branding, is_active, created_at
subscriptions: id, user_id, product_id, stripe_subscription_id, status, current_period_start, current_period_end, cancelled_at, cancel_reason, created_at
redemptions: id, subscription_id, item_type, redeemed_at, undone_at, undone_by

-- Loyalty
loyalty_cards: id, business_id, name, stamps_required, reward, item_stamped, expiry_days, bonus_days, branding, is_active, created_at
loyalty_memberships: id, user_id, card_id, current_stamps, last_stamp_at, created_at
stamps: id, membership_id, awarded_by, awarded_at, is_request, request_status, approved_by, approved_at

-- Referrals
referrals: id, referrer_id, referred_id, business_id, referral_code, status, qualified_at, credited_at, created_at
credits: id, user_id, business_id, amount_gbp, source, referral_id, expires_at, used_at, created_at
```

---

## Build Stages

### Stage 1: Foundation (COMPLETE)
- [x] Create Expo project
- [x] Create CLAUDE.md
- [x] Install and configure Tamagui
- [x] Set up Supabase client
- [x] Configure Expo Router navigation
- [x] Create base UI components
- [x] Set up Zustand stores

### Stage 1.5: UI Mockup Implementation (COMPLETE)
- [x] Customer Home screen with mock data
- [x] Customer Loyalty screen with stamp cards
- [x] Tab bar with lime dot indicator
- [x] Dev bypass for authentication testing

### Stage 2: Authentication & Users (COMPLETE)
- [x] Database schema for profiles (supabase/migrations/001_profiles.sql)
- [x] Customer registration wired to Supabase
- [x] Business owner registration wired to Supabase
- [x] Login screen wired to Supabase
- [x] Profile management with photo upload
- [x] Role-based navigation guards (lib/hooks/useAuthGuard.ts)

### Stage 3: Business Onboarding
- [ ] Businesses database schema
- [ ] Business profile wizard
- [ ] Google Business Profile integration
- [ ] Stripe Connect onboarding
- [ ] Admin approval workflow
- [ ] Staff invitation system

### Stage 4: Subscription Core
- [ ] Subscription products schema
- [ ] Product creation UI
- [ ] Stripe subscription integration
- [ ] Customer purchase flow
- [ ] Subscription management
- [ ] Exit survey

### Stage 5: Redemption System
- [ ] Redemptions schema
- [ ] QR code generation
- [ ] QR scanner
- [ ] Swipe-to-redeem UI
- [ ] Real-time staff notifications
- [ ] Undo functionality
- [ ] Blackout time enforcement

### Stage 6: Loyalty System
- [ ] Loyalty cards schema
- [ ] Card creation UI
- [ ] Staff stamp flow
- [ ] Customer stamp request
- [ ] Reward redemption
- [ ] Tiered billing

### Stage 7: Discovery & Profiles
- [ ] Business profile pages
- [ ] Location-based search
- [ ] Category filtering
- [ ] Featured businesses
- [ ] Browse UI

### Stage 8: Referrals & Notifications
- [ ] Referrals schema
- [ ] Referral configuration
- [ ] Link generation/tracking
- [ ] Push notifications
- [ ] Email notifications
- [ ] Notification centre

### Stage 9: Dashboards
- [ ] Business analytics dashboard
- [ ] Admin dashboard
- [ ] CSV exports
- [ ] Staff management

### Stage 10: Polish & Support
- [ ] Onboarding flows
- [ ] Help/FAQ
- [ ] Support form
- [ ] GDPR account deletion
- [ ] Error states
- [ ] Final testing
