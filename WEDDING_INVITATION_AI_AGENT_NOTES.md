# WEDDING INVITATION — AI AGENT PROJECT NOTES

## 1. Project Purpose

This project is a reusable digital wedding invitation website.

The website should feel:

- elegant
- romantic
- classic
- refined
- premium
- clean

The implementation should prioritize visual fidelity, usability, responsive behavior, performance, and maintainable code.

The provided visual references are the primary source of truth for the design.

---

# 2. Reference Folder

The project contains a dedicated `reference` folder.

Current reference files:

```text
reference/
├── End-Section.png
├── Full-reference.png
├── Groom&Pride-Section.png
├── Opening.png
├── Our-Moment-Section.png
├── Our-Section.png
├── Wedding-Event-Section.png
├── Wedding-gift-Section.png
└── Wishes-Section.png
```

These files are not decorative assets for the website.

They are **design references** that must be studied before implementing the corresponding parts of the website.

---

# 3. Reference Priority

`Full-reference.png` represents the overall visual direction of the invitation.

The individual section references provide more detailed visual information.

Use them together:

```text
Full-reference.png
        ↓
Overall design system
        ↓
Section reference
        ↓
Detailed implementation
```

If an assumption conflicts with the visual reference:

```text
REFERENCE
    ↑
higher priority
```

The reference should guide the visual decision.

---

# 4. Reference-to-Section Mapping

Use the following mapping when deciding which reference to study.

### Opening

```text
reference/Opening.png
```

Study this when implementing the opening/cover experience.

Pay attention to:

- first visual impression
- couple photo
- typography hierarchy
- floral/decorative placement
- background
- spacing
- invitation title
- couple names
- guest greeting
- "Buka Undangan" action
- visual entrance and transition

---

### Groom & Bride

```text
reference/Groom&Pride-Section.png
```

Study this for the section presenting the bride and groom.

Pay attention to:

- photo treatment
- individual presentation
- typography
- names
- spacing
- decorative elements
- visual relationship between bride and groom

Note: preserve the filename exactly as it exists in the project.

---

### Our Story / Our Section

```text
reference/Our-Section.png
```

Study this for the relationship/story section.

Pay attention to:

- content hierarchy
- typography
- narrative layout
- decorative elements
- image/text relationship

---

### Our Moments

```text
reference/Our-Moment-Section.png
```

Study this for the photo/moment section.

Pay attention to:

- gallery composition
- image proportions
- spacing
- image arrangement
- visual rhythm
- section title

---

### Wedding Event

```text
reference/Wedding-Event-Section.png
```

Study this for wedding event information.

Pay attention to:

- Akad
- Resepsi
- date
- time
- location
- event hierarchy
- decorative separators
- action/map information if present

---

### Wedding Gift

```text
reference/Wedding-gift-Section.png
```

Study this for wedding gift/payment information.

Pay attention to:

- bank/payment cards
- decorative elements
- card hierarchy
- account information
- copy interaction if present
- visual treatment

Do not expose sensitive information beyond what the client intentionally provides.

---

### Wishes / RSVP

```text
reference/Wishes-Section.png
```

Study this for the RSVP and guest wishes experience.

Pay attention to:

- RSVP form
- guest identity
- salutation/category selection
- attendance selection
- message field
- wishes/comments presentation
- input styling
- cards
- buttons
- validation states
- empty/loading states if required

---

### End / Closing

```text
reference/End-Section.png
```

Study this for the closing experience.

Pay attention to:

- final message
- couple photo or visual
- typography
- decorative elements
- closing hierarchy
- final visual transition

---

# 5. How the AI Agent Must Study References

Do not attempt to understand the entire long invitation screenshot in detail before every task.

Use a task-based approach.

```text
Current task
     ↓
Identify relevant reference
     ↓
Study section reference
     ↓
Use Full-reference.png for global context
     ↓
Study related assets
     ↓
Analyze
     ↓
Implement
     ↓
Compare with reference
     ↓
Refine
```

Example:

If the current task is the Opening:

```text
Primary:
reference/Opening.png

Context:
reference/Full-reference.png
```

If the current task is Wedding Gift:

```text
Primary:
reference/Wedding-gift-Section.png

Context:
reference/Full-reference.png
```

This prevents the AI agent from having to derive every detail from one extremely long image.

---

# 6. What to Analyze From Every Reference

Before implementing a section, analyze:

### Composition

- What is the focal point?
- Where are the major elements?
- How much space exists between elements?
- What is centered and what is intentionally offset?

### Hierarchy

Determine:

```text
Primary
↓
Secondary
↓
Supporting information
↓
Action
```

Not every element should have equal visual weight.

### Typography

Study:

- font character
- size relationship
- weight
- line height
- letter spacing
- alignment
- hierarchy

### Color

Study:

- background
- primary text
- accent
- decorative color
- contrast
- gradients if present

### Images

Study:

- aspect ratio
- crop
- position
- scale
- border treatment
- opacity
- overlay

### Decoration

Study:

- floral
- ornaments
- lines
- seals
- frames
- separators

Use the actual project assets when appropriate.

### Interaction

Determine whether the reference implies:

- button interaction
- opening transition
- scroll
- copy action
- form submission
- gallery interaction
- modal
- audio interaction

Do not invent unnecessary interactions.

---

# 7. Reference Is Not a Screenshot to Embed

Do not solve the design by placing the reference screenshot itself into the website.

The reference must be translated into:

```text
Reference
   ↓
Visual analysis
   ↓
HTML structure
   ↓
CSS layout
   ↓
JavaScript interaction
   ↓
Real project assets
```

Use HTML/CSS for real interface elements.

Use project assets for actual images and decorations.

---

# 8. Mobile-First Principle

The invitation is primarily intended to be opened on smartphones.

The layout must adapt to different phone sizes.

Requirements:

- no accidental horizontal scrolling
- readable typography
- preserved image proportions
- proportional spacing
- touch-friendly controls
- responsive layout
- no fixed desktop canvas as the fundamental layout model

Do not simply design a desktop page and scale it down.

The goal is:

> Preserve the visual relationships of the reference while adapting naturally to different screen sizes.

---

# 9. Technology Responsibilities

### HTML

Responsible for:

- semantic structure
- content hierarchy
- accessible markup

### CSS

Responsible for:

- layout
- typography
- colors
- spacing
- responsive behavior
- visual states
- transitions
- CSS animations

### JavaScript

Responsible for:

- interaction
- state
- dynamic behavior
- opening invitation
- form handling
- Firebase communication
- animations that require application logic

Do not use JavaScript for styling that CSS can handle naturally.

---

# 10. Animation Principle

Animation should have a purpose.

The principle is:

> Motion should communicate state.

The opening may use:

- subtle entrance animation
- gradual reveal
- elegant transitions
- button interaction
- opening/closing transition
- music activation after user interaction if music is implemented

Avoid:

- excessive bouncing
- excessive movement
- distracting effects
- animations that reduce readability

The visual reference determines the appropriate motion style.

---

# 11. Fonts

Primary fonts:

```text
Great Vibes
Cormorant Garamond
```

The project contains local font files and WOFF2 versions.

Use local/self-hosted fonts so the reusable template does not depend unnecessarily on external font loading.

Great Vibes is primarily suited to expressive/decorative typography such as names.

Cormorant Garamond is suited to formal/editorial information.

Typography must be treated as part of the layout, not merely as a font choice.

---

# 12. Color System

Primary palette:

```text
#FFE6E8
#FFB2C1
#752C30
#C0AD75
```

Conceptually:

```text
#FFE6E8 → soft foundation
#FFB2C1 → pink atmosphere/accent
#752C30 → primary visual anchor
#C0AD75 → refined gold accent
```

Do not use every color with equal visual weight.

The burgundy should act as a strong visual anchor.

Gold should generally remain selective so it retains its premium character.

---

# 13. Asset-Driven Design

Before recreating a visual element, inspect the project assets.

Relevant assets include:

```text
assets/
├── decorations/
├── fonts/
└── images/
```

The AI agent should determine which existing asset best matches the reference.

Do not select an asset only because its filename sounds appropriate.

Inspect the actual visual appearance.

Do not recreate existing artwork with CSS/SVG unnecessarily if the original asset is available and suitable.

---

# 14. Backend Architecture

The website is intended to work with static hosting and a serverless data layer.

The architecture should remain simple and portable.

Conceptually:

```text
User
 ↓
Static Hosting
 ↓
HTML + CSS + JavaScript
 ↓
Firebase SDK
 ↓
Firebase
 ├── RSVP
 └── Guest Wishes
```

Static hosting is responsible for serving:

- HTML
- CSS
- JavaScript
- images
- fonts
- video
- music
- other static assets

Firebase is responsible for dynamic data.

---

# 15. Static vs Dynamic Data

### Static

Keep these outside the database when possible:

```text
Couple names
Wedding date
Venue
Story
Photos
Video
Music
Decorations
Page content
```

### Dynamic

Use Firebase for:

```text
RSVP
Guest name
Salutation
Attendance
Guest count
Guest wishes
Timestamp
```

Do not put everything into Firebase merely because Firebase is available.

---

# 16. RSVP — Salutation / Gender Category

The reference contains a category allowing guests to choose:

```text
Saudara
Saudari
```

This is part of the RSVP UX and data model.

The value should be stored separately from the person's name.

Prefer:

```text
{
    name: "Ahmad",
    salutation: "saudara"
}
```

rather than:

```text
{
    name: "Saudara Ahmad"
}
```

This allows the frontend to control how the greeting is rendered.

Possible presentation:

```text
Saudara Ahmad
```

or:

```text
Saudari Diana
```

The exact visual presentation must follow the reference.

The valid values should be constrained by the application/security layer.

Do not automatically replace the terminology with "Male/Female", "Mr/Mrs", or other terminology. The requirement is specifically the `Saudara / Saudari` category shown in the reference.

---

# 17. Firebase Security

Firebase configuration visible to frontend code should not be treated as a secret.

Security must come from:

```text
Firebase Security Rules
+
input validation
+
restricted operations
```

Users must not be able to arbitrarily:

- delete another guest's data
- modify another guest's data
- write arbitrary fields
- perform unnecessary database operations

Guest wishes are untrusted user-generated content.

Do not render user content using unsafe `innerHTML` without proper sanitization.

---

# 18. Privacy

Only collect information required by the invitation.

Do not collect additional personal information simply because it is technically possible.

RSVP and guest wishes should only expose information necessary for the intended invitation experience.

---

# 19. Performance

The opening should remain fast.

Do not load large dynamic datasets unnecessarily during the initial opening.

Firebase data can be loaded when the relevant section requires it.

Optimize:

- WebP images
- WOFF2 fonts
- video
- music
- database reads

Do not load assets that are not needed.

---

# 20. Reusable Template Principle

The project should eventually support:

```text
ONE CODEBASE
    ├── Wedding A
    ├── Wedding B
    ├── Wedding C
    └── Wedding D
```

Separate reusable UI/design from wedding-specific content.

However, avoid over-engineering too early.

First make one invitation work correctly.

Then identify which elements are truly reusable.

---

# 21. Development Workflow

Work section-by-section.

```text
1. Identify task
2. Identify relevant reference
3. Study section reference
4. Study Full-reference.png for context
5. Inspect relevant assets
6. Analyze layout and hierarchy
7. Implement semantic structure
8. Implement responsive styling
9. Add interaction
10. Add purposeful animation
11. Test
12. Compare against reference
13. Refine
14. Continue to next section
```

Do not implement the entire website blindly in one pass.

---

# 22. First Implementation Priority

The first implementation should focus on the Opening.

Primary reference:

```text
reference/Opening.png
```

Global context:

```text
reference/Full-reference.png
```

The opening should be treated as an experience, not merely the first HTML section.

Conceptually:

```text
User opens invitation
        ↓
Visual introduction
        ↓
Couple identity
        ↓
Guest greeting
        ↓
"Buka Undangan"
        ↓
Opening transition
        ↓
Main invitation
```

The exact composition, asset selection, spacing, and animation must be derived from the reference.

Do not hardcode arbitrary dimensions simply to imitate a screenshot.

---

# 23. Core Philosophy

This project is not merely an HTML/CSS exercise.

It is a digital wedding experience.

Priorities:

```text
Visual Accuracy
      ↓
User Experience
      ↓
Responsive Behavior
      ↓
Performance
      ↓
Code Quality
```

Every technical decision should support those priorities.

When the reference provides enough information, study it first instead of guessing.

When the reference does not specify something, choose the simplest solution that remains consistent with the existing visual system.
