function Filter(id, filter, page, limit) {
  this.type = "filter";

  if (!Array.isArray(id)) {
    this.id = id;
  } else {
    filter = id;
  }

  const splitFilter = filter[0].split(/(=\*|=)/);

  this.key = splitFilter[0];
  this.filter = splitFilter[1];
  this.value = splitFilter[2];

  this.page = page;
  this.limit = limit;
}

const FilterType = (id, filter, page, limit) =>
  new Filter(id, filter, page, limit);

window.__HUX_PROFILER_FILTER_TYPE__ = FilterType;

export { FilterType };
