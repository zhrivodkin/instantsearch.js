// Add here your javascript code

var search = instantsearch({
  // Replace with your own values
  appId: 'latency',
  apiKey: '3d9875e51fbd20c7754e65422f7ce5e1', // search only API key, no ADMIN key
  indexName: 'bestbuy',
  urlSync: true
});

// initialize SearchBox
search.addWidget(
  instantsearch.widgets.searchBox({
    container: '#search-box',
  })
);

search.addWidget(
  instantsearch.widgets.hits({
    container: '#hits',
    templates: {
      item: '{{name}}'
    }
  })
);

search.addWidget(instantsearch.widgets.refinementList({
  container: '#brand',
  attributeName: 'manufacturer'
}));

const filtersContainer = '#currentFilters';
const currentFilters = instantsearch.widgets.currentRefinedValues({
  container: '#currentFilters',
  autoHideContainer: false
});

search.addWidget({
  init: function(opts) {
    currentFilters.init(opts);
  },
  render: function(opts) {
    if(opts.results.nbHits === 0) {
      document.querySelector(filtersContainer).style.display = 'block';
      currentFilters.render(opts);
    } else {
      document.querySelector(filtersContainer).style.display = 'none';
    }
  }
});

search.start();

const showWhenNoResults = (widgetFactory) => (widgetParams) => {
  const {container} = widgetParams;
  const domContainer = typeof container === 'string' ? document.querySelector(container) : container;
  const widget = widgetFactory(widgetParams);
  return {
    getConfiguration: function(...allParams) {
      if(widget.getConfiguration) widget.getConfiguration(...allParams);
    },
    init: function(opts) {
      const {helper} = opts;
      if(widget.init) widget.init(opts);
    },
    render: function(opts) {
      if(widget.render) widget.render(opts);
    }
  };
}
