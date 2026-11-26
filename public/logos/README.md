# Vendor and Product Logos

This directory is reserved for official vendor and product logos.

## Usage rules

- **Official sources only:** Files placed here must come exclusively from a vendor's official brand or press kit (`source: "press-kit"`), or from a licensed logo provider under the terms of that licence (`source: "licensed-provider"`).
- **No generated or scraped marks:** Never generate, trace, imitate, or scrape company trademarks into this directory. Until an official asset is added, Faresolution renders the generated `LogoMark` monogram fallback automatically.
- **Brand guidelines:** Every asset must follow the brand's own clear-space, aspect-ratio, and colour rules.
- **Data integrity:** Every `logo` entry on a `Vendor` or `Product` in `lib/data/content/` must reference an existing file under `/logos/...`, record its intrinsic `width` and `height`, and declare `source` and `retrievedAt`.
