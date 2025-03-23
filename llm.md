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


# This is how we will proceed

## We need to iterate through every doc `.mdx` file
### This is `rating.mdx`

```
## Usage

<Demo data={RatingDemos.configurator} />
```
When we come across a <Demo> component what should we do?

You can find these at `packages/@docs/demos/rating`

`packages/@docs/demos/src/demos/core/Rating/Rating.demos.story.tsx`


# Wait

`mdx-core-data.ts` might be a good entry point. And there is `mdx-nav-data.ts` which organizes stuff into logical groupings which might be good for the LLM, hmmm. There's also `mdx-pages-group.ts` which might be nice.

It contains a bunch of these:
```
Box: {
    title: 'Box',
    package: '@mantine/core',
    slug: '/core/box',
    description: 'Base component for all Mantine components',
    source: '@mantine/core/src/core/Box/Box.tsx',
    docs: 'core/box.mdx',
  },
```

The `llms.txt` standard talks about having links being important, so linking to the source code might be important?

So it would link to `core/box.mdx`

So what's in `box.mdx`

First we start with title: Box

Then we seem to have the `##Usage` section. And then the rest of the text is honestly fine, so this is a bad example.

Ok let's try the next one

```
Button: {
    title: 'Button',
    package: '@mantine/core',
    slug: '/core/button',
    description: 'Button component to render button or link',
    componentPrefix: 'Button',
    props: ['Button', 'ButtonGroup'],
    styles: ['Button', 'ButtonGroup'],
    source: '@mantine/core/src/components/Button/Button.tsx',
    docs: 'core/button.mdx',
  },
  ```

Ok this one is much bigger. Tons of stuff on the documentation page (which comes from `core/button.mdx`) and we also have props and styles sections which are critical.

So for constructing the llm.txt, we'd want the basic info like title, package, the slug would be useful for creaiting the link, the description is good, not sure what the componentPrefix does, then `props` and `styles` are critical. Not sure we need to link to the source code. Then of course `docs`.

How would we populate `props`?

well, this object is part of `MDX_CORE_DATA` which is eventually spread into `MDX_DATA`

So then you can find this with `MDX_DATA.Button` since that's the object key.

So if you visit `core/button.dx` it is used like this:

`export default Layout(MDX_DATA.Button);`

When you look at the beginning:

```
## Usage

<Demo data={ButtonDemos.configurator} />
```

This `ButtonDemos` thing seems like it might be important. Because we *could* just ignore all the `<Demo>` components but... seems like we should actually
