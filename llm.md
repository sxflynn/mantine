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

This `ButtonDemos` thing seems like it might be important. Because we *could* just ignore all the `<Demo>` components but... seems like we should actually parse it and show it?

Now on the actual docs site, what is shown is the actual component (we cannot show that here) and this code:
```
import { Button } from '@mantine/core';

function Demo() {
  return <Button variant="filled">Button</Button>;
}
```
Maybe the strategy is to figure out how to grab that text block from a `Demo` component.

```packages/@docs/demos/src/index.ts
export * as ButtonDemos from './demos/core/Button';
```

```packages/@docs/demos/src/demos/core/Button/index.ts
export { configurator } from './Button.demo.configurator';
```

Ok now we are at `packages/@docs/demos/src/demos/core/Button/Button.demo.configurator.tsx`

Here we see
```
const code = `
import { Button } from '@mantine/core';

function Demo() {
  return <Button{{props}}>Button</Button>;
}
`;
```

So it seems like this code 'object' should be string outputted. But what to do with the {{props}} thing.

In the actual code, `props` is = to `variant="filled"`


Hmm, in the `Button.demo.fullWidth` file, the actual output code says `return <Button fullWidth>Full width button</Button>;` and the code in this file is `return <Button fullWidth>Full width button</Button>;` so in that case, the code in the `code` object is good as is.

Ok back to `Button.demo.configurator` so I followed the `configurator` object which is

```
export const configurator: MantineDemo = {
  type: 'configurator',
  component: Wrapper,
  code,
  centered: true,
  controls: [
    interactiveVariantsControl,
    { type: 'color', prop: 'color', initialValue: 'blue', libraryValue: 'blue' },
    { type: 'size', prop: 'size', initialValue: 'sm', libraryValue: 'sm' },
    { type: 'size', prop: 'radius', initialValue: 'sm', libraryValue: 'sm' },
  ],
};
```

I followed `interactiveVariantsControl` which is imported from `import { interactiveVariantsControl } from '../../../shared';` and it has:

```
export const interactiveVariantsControl: ConfiguratorControlOptions = {
  type: 'select',
  prop: 'variant',
  data: INTERACTIVE_VARIANTS,
  initialValue: 'filled',
  libraryValue: '__none__',
};
```

Boom. So when you encounter `{{props}}` you  have to find the `prop` and `initialValue`.

Let me see if this also works in another one with `{{props}}`.

Let's look at `Alert`

`packages/@docs/demos/src/demos/core/Alert/Alert.demo.configurator.tsx`

```
const code = `
import { Alert } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';

function Demo() {
  const icon = <IconInfoCircle />;
  return (
    <Alert{{props}} icon={icon}>
      {{children}}
    </Alert>
  );
}
`;
```

and this is the target code
```
import { Alert } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';

function Demo() {
  const icon = <IconInfoCircle />;
  return (
    <Alert variant="light" color="blue" title="Alert title" icon={icon}>
      Lorem ipsum dolor sit, amet consectetur adipisicing elit. At officiis, quae tempore necessitatibus placeat saepe.
    </Alert>
  );
}
```

btw this is 89 tokens, which means in a 30,000 token limit we could fit 337 of these types of blocks.

Okay so how do we resolve `{{props}}` which is `variant="light" color="blue" title="Alert title"` and `{{children}}` which is the Lorem ipsum text?

### `{{props}}`

If you look in the `configurator` object again:
```
export const configurator: MantineDemo = {
  type: 'configurator',
  component: Wrapper,
  code,
  centered: true,
  maxWidth: 400,
  controls: [
    { ...(staticVariantsControl as any), initialValue: 'light' },
    { type: 'color', prop: 'color', initialValue: 'blue', libraryValue: null },
    { type: 'size', prop: 'radius', initialValue: 'sm', libraryValue: 'sm' },
    { type: 'boolean', prop: 'withCloseButton', initialValue: false, libraryValue: false },
    { type: 'string', prop: 'title', initialValue: 'Alert title', libraryValue: null },
    {
      type: 'string',
      prop: 'children',
      initialValue:
        'Lorem ipsum dolor sit, amet consectetur adipisicing elit. At officiis, quae tempore necessitatibus placeat saepe.',
      libraryValue: null,
    },
  ],
};
```

We see:

- color = blue
- radius = sm
- withCloseButton = false
- title = 'Alert title'
- children = 'Lorem ipsum...

So how did the final output only have `variant="light" color="blue" title="Alert title"` why did it exclude `withCloseButton` and `radius`?

Well, `radius` initialValue and libraryValue are both `'sm'` and `withCloseButton` initialValue and libraryValue are both `false`.But `color` and `title` are different initialValues from the libraryValue.

What about `variant="light"`

Well let's examine `staticVariantsControl`

```
export const staticVariantsControl: ConfiguratorControlOptions = {
  type: 'select',
  prop: 'variant',
  data: STATIC_VARIANTS,
  initialValue: 'filled',
  libraryValue: '__none__',
};
```
In that case it says `initialValue` is `filled` in the code, but then in the actual `controls` array it's set to `initialValue`: `'light'`.

So that's how we got it.

### So is there code that already does this parsing stuff?

I think so. We need to find the `Demo` function and see how it takes all this config stuff and actually renders.

Here is the `.d.ts` definition : `packages/@mantinex/demo/lib/Demo/Demo.d.ts`

I found `Demo.tsx`: `packages/@mantinex/demo/src/Demo/Demo.tsx`

Ahh I see, the `@mantinex` package seems to be directly related to rendering components specifically on the dev site.


So here is the path I can see for rendering a Demo:

To render a demo you need to provide:
 ```
  data: MantineDemo;
  demoProps?: {
    defaultExpanded?: boolean;
    maxCollapsedHeight?: number;
```

Cool. So the biggest thing is looking at that `data` prop. Let's drill back up to `Alert`.

1. `alert.mdx` in `apps/mantine.dev/src/pages/core/alert.mdx`
1. Find the first instance of `<Demo data={AlertDemos.configurator} />`
1. Ok theres that `Demo` component. What exactly is the `data`?
1. `packages/@docs/demos/src/index.ts` -> `export * as AlertDemos from './demos/core/Alert';`
1. `packages/@docs/demos/src/demos/core/Alert/index.ts` -> `export { configurator } from './Alert.demo.configurator'; export { stylesApi } from './Alert.demo.stylesApi';`
1. Which brings us to the `export const configurator: MantineDemo = {` object.

Cool, so now we have the `data` object used in the `Demo` component, located at `packages/@mantinex/demo/src/Demo/Demo.tsx`.

So first we see the `type: 'configurator',` property. So it returns:

```tsx
case 'configurator':
      return (
        <ConfiguratorDemo {...data} {...demoProps}>
          <data.component />
        </ConfiguratorDemo>
      );
```




# Functions that need to be created
 - How to display demo code in its pure string form


## Utilities
 - If you detect a string that begins with 'Lorem ipsum dolor sit' then slice off the rest of the string.
 - Count the tokens of the entire output
