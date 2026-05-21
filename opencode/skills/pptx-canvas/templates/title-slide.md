# Title Slide — First Impression

## Purpose

The opening slide of the deck. Establishes the presentation's topic, sets the visual
tone, and identifies the presenter or organization. Should feel confident and
uncluttered — give the audience a moment to settle in.

## Structure

- Presentation title: large, bold, prominent
- Subtitle or tagline: smaller, below the title
- Presenter name, role, date: bottom area, understated
- Optional: organization logo or thematic background image

## HTML Sketch

Drop the following inside the scaffold's `#slide` element. Add the layout styles
to `#slide` itself (background, flexbox, padding) by editing its `style` attribute.

```html
<!-- on #slide: display:flex; flex-direction:column; justify-content:center;
     align-items:center; text-align:center; background:___; padding:60px; -->
<h1 style="font-size:___; color:___;">Presentation Title</h1>
<p style="font-size:___; color:___; margin-top:16px;">Subtitle or tagline goes here</p>
<p style="font-size:___; color:___; margin-top:auto;">Presenter Name · Role · Date</p>
```

## Usage Notes

- Exactly one per deck, always the first slide.
- Keep the title to one or two lines maximum.
- The subtitle should give context, not repeat the title.
- On dark themes, consider a subtle gradient or background image with overlay.
