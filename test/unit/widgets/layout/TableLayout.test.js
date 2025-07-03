describe('Ext.layout.TableLayout rendering', () => {
  let mockCt, mountEl;

  beforeEach(() => {
    mountEl = document.createElement('div');
    mountEl.id = 'test-mount';
    document.body.appendChild(mountEl);
    mockCt = new Ext.Container({
      renderTo: mountEl,
      layout: 'table',
      layoutConfig: {
        columns: 2
      },
      items: [
        { html: 'Cell 1' },
        { html: 'Cell 2' },
        { html: 'Cell 3', colspan: 2 }
      ]
    });
  });

  afterEach(() => {
    mountEl.remove();
  });

  it('should create a table and render all items', () => {
    const table = mountEl.querySelector('table.x-table-layout');
    expect(table).toBeTruthy();
    expect(table.querySelectorAll('td').length).toBe(3);
  });

  it('should track used cell positions correctly via getNextCell', () => {
    expect(mockCt.layout.cells.length).toBeGreaterThan(0);
    expect(mockCt.layout.cells[0][0]).toBe(true);
    expect(mockCt.layout.cells[0][1]).toBe(true);
    expect(mockCt.layout.cells[1][0]).toBe(true); // From colspan row
    expect(mockCt.layout.cells[1][1]).toBe(true);
  });
});
