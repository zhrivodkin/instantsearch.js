import { checkRendering } from '../../lib/utils';

const usage = `Usage:
var customRefresh = connectRefresh(function render(params, isFirstRendering) {
  // params = {
  //   refine,
  //   widgetParams,
  // }
});
search.addWidget(
  customRefresh({
    ...widgetParams
  })
);
Full documentation available at https://community.algolia.com/instantsearch.js/connectors/connectRefresh.html
`;

/**
 * @typedef {Object} CustomRefreshWidgetOptions
 */

/**
 * @typedef {Object} RefreshRenderingOptions
 * @property {function()} refine Refreshes the current search results
 * @property {Object} widgetParams All original `CustomRefreshWidgetOptions` forwarded to the `renderFn`.
 */

/**
 * **Refresh** connector provides the logic to build a widget that will allow
 * the user to renew the search results, in case you know the data is changed.
 *
 * It's always a good idea to only show this widget when something actually
 * has changed. You can use for example web sockets or server sent events to
 * notify the frontend that an operation to the Algolia index is complete.
 *
 * @type {Connector}
 * @param {function(RefreshRenderingOptions, boolean)} renderFn Rendering function for the custom **Refresh** widget.
 * @param {function} unmountFn Unmount function called when the widget is disposed.
 * @return {function(CustomRefreshWidgetOptions)} Re-usable widget factory for a custom **Refresh** widget.
 * @example
 * // custom `renderFn` to render the custom Refresh widget
 * function renderFn(RefreshRenderingOptions, isFirstRendering) {
 *   if (isFirstRendering || !RefreshRenderingOptions.widgetParams.canRefine) {
 *     // we keep the widget empty if we can't refresh
 *     RefreshRenderingOptions.widgetParams.containerNode.innerText = '';
 *   }
 *
 *   var button = document.createElement('button');
 *   button.innerText = 'Refresh 🔄';
 *   button.addEventListener('click', RefreshRenderingOptions.refine);
 *   RefreshRenderingOptions.widgetParams.containerNode.appendChild(button);
 * }
 *
 * // connect `renderFn` to Refresh logic
 * var customRefresh = instantsearch.connectors.connectRefresh(renderFn);
 *
 * // mount widget on the page
 * search.addWidget(
 *   customRefresh({
 *     containerNode: document.getElementById('custom-refresh-container'),
 *     canRefresh: true, // get this data from your indexing events.
 *   })
 * );
 */
export default function connectRefresh(renderFn, unmountFn) {
  checkRendering(renderFn, usage);

  return (widgetParams = {}) => {
    let refine = function() {};

    return {
      getConfiguration() {},
      init({ instantSearchInstance }) {
        refine = instantSearchInstance.refresh;
        renderFn(
          {
            refine,
            widgetParams,
          },
          true
        );
      },
      render({ instantSearchInstance }) {
        refine = instantSearchInstance.refresh;
        renderFn(
          {
            refine,
            widgetParams,
          },
          false
        );
      },
      dispose() {
        unmountFn();
      },
    };
  };
}
