## Where to find the docs

`apps/mantine.dev/src/pages/core`

For example


MdxStylesApiSelectors is an mdx component but it has like the actual content.

```mdx
export function MdxStylesApiSelectors({ component }: MdxStylesApiSelectorsProps) {
  return (
    <>
      <MdxTitle id="styles-api">Styles API</MdxTitle>
      <MdxParagraph>
        <MdxCode>{component}</MdxCode> supports{' '}
        <MdxLink href="/styles/styles-api/">Styles API</MdxLink>, you can add styles to any inner
        element of the component with
        <MdxCode>classNames</MdxCode> prop. Follow{' '}
        <MdxLink href="/styles/styles-api/">Styles API</MdxLink> documentation to learn more.
      </MdxParagraph>
    </>
  );
}
```

On the website it says:

> Alert supports Styles API, you can add styles to any inner element of the component withclassNames prop. Follow Styles API documentation to learn more.

Has all the mdx files for core
