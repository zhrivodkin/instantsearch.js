import jsHelper, { SearchResults } from 'algoliasearch-helper';

import connectRefresh from '../connectRefresh';
const fakeClient = { addAlgoliaAgent: () => {} };

const createWidget = () => {
  // test that the dummyRendering is called with the isFirstRendering
  // flag set accordingly
  const rendering = jest.fn();
  const makeWidget = connectRefresh(rendering);
  const widget = makeWidget({
    foo: 'bar', // dummy param for `widgetParams` test
  });
  return { rendering, widget };
};

describe('connectRefresh', () => {
  it('has no configuration', () => {});
  it('Renders during init and render', () => {
    const { rendering, widget } = createWidget();

    // does not have a getConfiguration method
    expect(widget.getConfiguration()).toBe(undefined);

    const helper = jsHelper(fakeClient);
    helper.search = jest.fn();

    widget.init({
      helper,
      state: helper.state,
      createURL: () => '#',
      onHistoryChange: () => {},
      instantSearchInstance: { refresh() {} },
    });

    {
      const [firstRenderingOptions, isFirstRendering] = rendering.mock.calls[
        rendering.mock.calls.length - 1
      ];

      // should call the rendering once with isFirstRendering to true
      expect(rendering.mock.calls).toHaveLength(1);

      expect(isFirstRendering).toBe(true);

      // should provide good values for the first rendering
      expect(firstRenderingOptions.refine.toString()).toBe('refresh() {}');
      expect(firstRenderingOptions.widgetParams).toEqual({
        foo: 'bar',
      });
    }

    widget.render({
      results: new SearchResults(helper.state, [
        {
          hits: [{ test: 'oneTime' }],
          nbHits: 1,
          nbPages: 1,
          page: 0,
        },
      ]),
      state: helper.state,
      helper,
      createURL: () => '#',
      instantSearchInstance: { refresh() {} },
    });

    {
      // Should call the rendering a second time, with isFirstRendering to false
      expect(rendering.mock.calls).toHaveLength(2);
      const [secondRenderingOptions, isFirstRendering] = rendering.mock.calls[
        rendering.mock.calls.length - 1
      ];
      expect(isFirstRendering).toBe(false);

      // should call the rendering with values from the results
      expect(secondRenderingOptions.refine.toString()).toBe('refresh() {}');
    }
  });

  it('Provides a function to update the refinements at each step', () => {
    const { rendering, widget } = createWidget();

    const helper = jsHelper(fakeClient);
    helper.search = jest.fn();

    const refresh = jest.fn();

    widget.init({
      helper,
      state: helper.state,
      createURL: () => '#',
      onHistoryChange: () => {},
      instantSearchInstance: { refresh },
    });

    {
      // first rendering
      const [{ refine }] = rendering.mock.calls[
        rendering.mock.calls.length - 1
      ];
      refine();

      expect(refresh).toHaveBeenCalledTimes(1);
    }

    widget.render({
      results: new SearchResults(helper.state, [{}]),
      state: helper.state,
      helper,
      createURL: () => '#',
      instantSearchInstance: { refresh },
    });

    {
      // Second rendering
      const [{ refine }] = rendering.mock.calls[
        rendering.mock.calls.length - 1
      ];
      refine();
      expect(refresh).toHaveBeenCalledTimes(2);
    }
  });
});
