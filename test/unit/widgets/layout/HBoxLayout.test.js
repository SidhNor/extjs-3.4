/**
 * Vitest tests for Ext.layout.HBoxLayout
 */

function buildFakeChild(config) {
  config = config || {};

  Ext.applyIf(config, {
    getWidth: () => 10,
    getHeight: () => 10,
    getSize: () => ({ height: 10, width: 10 }),
    margins: { top: 0, right: 0, bottom: 0, left: 0 }
  });

  return config;
}

function buildLayout(config) {
  config = config || {};

  Ext.applyIf(config, { padding: { top: 0, right: 0, bottom: 0, left: 0 } });

  return new Ext.layout.HBoxLayout(config);
}

describe('Ext.layout.HBoxLayout - calculating flexed box sizes', () => {
  let layout;
  let items;
  let targetSize;

  beforeEach(() => {
    layout = buildLayout();
    items = [
      buildFakeChild({ flex: 1 }),
      buildFakeChild({ flex: 1 }),
      buildFakeChild({ flex: 1 }),
      buildFakeChild({ flex: 1 })
    ];
    targetSize = { height: 100, width: 400 };
  });

  it('equal flex widths', () => {
    const { boxes } = layout.calculateChildBoxes(items, targetSize);
    expect(boxes[0].width).toBe(100);
    expect(boxes[1].width).toBe(100);
    expect(boxes[2].width).toBe(100);
    expect(boxes[3].width).toBe(100);
  });

  it('different flex widths', () => {
    items = [
      buildFakeChild({ flex: 1 }),
      buildFakeChild({ flex: 2 }),
      buildFakeChild({ flex: 3 }),
      buildFakeChild({ flex: 4 })
    ];
    const { boxes } = layout.calculateChildBoxes(items, targetSize);
    expect(boxes[0].width).toBe(40);
    expect(boxes[1].width).toBe(80);
    expect(boxes[2].width).toBe(120);
    expect(boxes[3].width).toBe(160);
  });

  it('margins accounted for', () => {
    const itemsWithMargins = [
      buildFakeChild({ flex: 1, margins: { left: 10, right: 10, top: 0, bottom: 0 } }),
      buildFakeChild({ flex: 1, margins: { left: 10, right: 10, top: 0, bottom: 0 } }),
      buildFakeChild({ flex: 1, margins: { left: 10, right: 10, top: 0, bottom: 0 } }),
      buildFakeChild({ flex: 1, margins: { left: 10, right: 10, top: 0, bottom: 0 } })
    ];
    const { boxes } = layout.calculateChildBoxes(itemsWithMargins, targetSize);
    expect(boxes[0].width).toBe(80);
    expect(boxes[1].width).toBe(80);
    expect(boxes[2].width).toBe(80);
    expect(boxes[3].width).toBe(80);
  });

  it('padding accounted for', () => {
    layout = buildLayout({ padding: { top: 10, right: 10, bottom: 10, left: 10 } });
    const { boxes } = layout.calculateChildBoxes(items, targetSize);
    expect(boxes[0].width).toBe(95);
    expect(boxes[1].width).toBe(95);
    expect(boxes[2].width).toBe(95);
    expect(boxes[3].width).toBe(95);
  });

  it('width dominates flex', () => {
    const itemsWithWidth = [
      buildFakeChild({ flex: 1, width: 250, getWidth: () => 250 }),
      buildFakeChild({ flex: 1 }),
      buildFakeChild({ flex: 1 }),
      buildFakeChild({ flex: 1 })
    ];
    const { boxes } = layout.calculateChildBoxes(itemsWithWidth, targetSize);
    expect(boxes[0].width).toBe(250);
    expect(boxes[1].width).toBe(50);
    expect(boxes[2].width).toBe(50);
    expect(boxes[3].width).toBe(50);
  });
});

describe('Ext.layout.HBoxLayout - minWidth of items', () => {
  let layout;
  let items;

  beforeEach(() => {
    layout = buildLayout();
    layout.beforeCt = { getWidth: () => 0, createChild: Ext.emptyFn };
    layout.afterCt = { getWidth: () => 0, createChild: Ext.emptyFn };
    items = [
      buildFakeChild({ width: 100, minWidth: 100 }),
      buildFakeChild({ width: 200, minWidth: 120 }),
      buildFakeChild({ width: 200, minWidth: 120 }),
      buildFakeChild({ width: 200, minWidth: 120 })
    ];
  });

  it('available width is sufficient', () => {
    const targetSize = { width: 700, height: 25 };
    const { boxes } = layout.calculateChildBoxes(items, targetSize);
    expect(boxes[0].left).toBe(0);
    expect(boxes[1].left).toBe(100);
    expect(boxes[2].left).toBe(300);
    expect(boxes[3].left).toBe(500);

    expect(boxes[0].width).toBe(100);
    expect(boxes[1].width).toBe(200);
    expect(boxes[2].width).toBe(200);
    expect(boxes[3].width).toBe(200);
  });

  it('has shortfall', () => {
    const targetSize = { width: 500, height: 25 };
    const { boxes } = layout.calculateChildBoxes(items, targetSize);
    expect(boxes[0].width).toBe(100);
    expect(boxes[1].width).toBe(134);
    expect(boxes[2].width).toBe(133);
    expect(boxes[3].width).toBe(133);

    expect(boxes[0].left).toBe(0);
    expect(boxes[1].left).toBe(100);
    expect(boxes[2].left).toBe(234);
    expect(boxes[3].left).toBe(367);
  });

  it('too narrow', () => {
    const targetSize = { width: 400, height: 25 };
    const { boxes } = layout.calculateChildBoxes(items, targetSize);
    expect(boxes[0].left).toBe(0);
    expect(boxes[1].left).toBe(100);
    expect(boxes[2].left).toBe(220);
    expect(boxes[3].left).toBe(340);

    expect(boxes[0].width).toBe(100);
    expect(boxes[1].width).toBe(120);
    expect(boxes[2].width).toBe(120);
    expect(boxes[3].width).toBe(120);
  });
});

describe('Ext.layout.HBoxLayout - aligning', () => {
  let layout;
  let items;
  let targetSize;

  beforeEach(() => {
    items = [
      buildFakeChild({ flex: 1, getHeight: () => 10 }),
      buildFakeChild({ flex: 1, getHeight: () => 20 }),
      buildFakeChild({ flex: 1, getHeight: () => 30 }),
      buildFakeChild({ flex: 1, getHeight: () => 40 })
    ];
    targetSize = { height: 100, width: 400 };
  });

  it('top align', () => {
    layout = buildLayout({ align: 'top' });
    const { boxes } = layout.calculateChildBoxes(items, targetSize);
    expect(boxes[0].top).toBe(0);
    expect(boxes[1].top).toBe(0);
    expect(boxes[2].top).toBe(0);
    expect(boxes[3].top).toBe(0);
  });

  it('middle align', () => {
    layout = buildLayout({ align: 'middle' });
    const { boxes } = layout.calculateChildBoxes(items, targetSize);
    expect(boxes[0].top).toBe(45);
    expect(boxes[1].top).toBe(40);
    expect(boxes[2].top).toBe(35);
    expect(boxes[3].top).toBe(30);
  });

  it('stretch align', () => {
    layout = buildLayout({ align: 'stretch' });
    const { boxes } = layout.calculateChildBoxes(items, targetSize);
    expect(boxes[0].top).toBe(0);
    expect(boxes[1].top).toBe(0);
    expect(boxes[2].top).toBe(0);
    expect(boxes[3].top).toBe(0);

    expect(boxes[0].height).toBe(100);
    expect(boxes[1].height).toBe(100);
    expect(boxes[2].height).toBe(100);
    expect(boxes[3].height).toBe(100);
  });

  it('stretchmax align', () => {
    layout = buildLayout({ align: 'stretchmax' });
    const { boxes } = layout.calculateChildBoxes(items, targetSize);
    expect(boxes[0].top).toBe(0);
    expect(boxes[1].top).toBe(0);
    expect(boxes[2].top).toBe(0);
    expect(boxes[3].top).toBe(0);

    expect(boxes[0].height).toBe(40);
    expect(boxes[1].height).toBe(40);
    expect(boxes[2].height).toBe(40);
    expect(boxes[3].height).toBe(40);
  });
});

describe('Ext.layout.HBoxLayout - packing', () => {
  let layout;
  let items;
  let targetSize;

  beforeEach(() => {
    items = [
      buildFakeChild({ getSize: () => ({ height: 10, width: 10 }) }),
      buildFakeChild({ getSize: () => ({ height: 10, width: 20 }) }),
      buildFakeChild({ getSize: () => ({ height: 10, width: 30 }) }),
      buildFakeChild({ getSize: () => ({ height: 10, width: 40 }) })
    ];
    targetSize = { height: 100, width: 400 };
  });

  it('pack start', () => {
    layout = buildLayout({ pack: 'start' });
    const { boxes } = layout.calculateChildBoxes(items, targetSize);
    expect(boxes[0].left).toBe(0);
    expect(boxes[1].left).toBe(10);
    expect(boxes[2].left).toBe(30);
    expect(boxes[3].left).toBe(60);
  });

  it('pack center', () => {
    layout = buildLayout({ pack: 'center' });
    const { boxes } = layout.calculateChildBoxes(items, targetSize);
    expect(boxes[0].left).toBe(150);
    expect(boxes[1].left).toBe(160);
    expect(boxes[2].left).toBe(180);
    expect(boxes[3].left).toBe(210);
  });

  it('pack end', () => {
    layout = buildLayout({ pack: 'end' });
    const { boxes } = layout.calculateChildBoxes(items, targetSize);
    expect(boxes[0].left).toBe(300);
    expect(boxes[1].left).toBe(310);
    expect(boxes[2].left).toBe(330);
    expect(boxes[3].left).toBe(360);
  });

  it('width property dominates getWidth', () => {
    layout = buildLayout({ pack: 'start', align: 'stretch' });
    const itemsWithProps = [
      {
        title: 'Panel 1',
        flex: 1,
        html: 'flex : 1',
        frame: true,
        margins: { top: 0, left: 0, right: 0, bottom: 0 },
        getHeight: () => 10,
        getWidth: () => 10
      },
      {
        title: 'Panel 2',
        width: 100,
        html: 'width : 100',
        frame: true,
        margins: { top: 0, left: 0, right: 0, bottom: 0 },
        getHeight: () => 10,
        getWidth: () => 10
      },
      {
        title: 'Panel 3',
        flex: 2,
        html: 'flex : 2',
        frame: true,
        margins: { top: 0, left: 0, right: 0, bottom: 0 },
        getHeight: () => 10,
        getWidth: () => 10
      }
    ];
    const { boxes } = layout.calculateChildBoxes(itemsWithProps, targetSize);
    expect(boxes[0].left).toBe(0);
    expect(boxes[1].left).toBe(100);
    expect(boxes[2].left).toBe(200);
  });
});

describe('Ext.layout.HBoxLayout - meta data from calculated box sizes', () => {
  let layout;
  let items;
  let targetSize;

  beforeEach(() => {
    layout = buildLayout();
    items = [
      buildFakeChild({ getHeight: () => 50, flex: 1 }),
      buildFakeChild({ getHeight: () => 60, flex: 1 }),
      buildFakeChild({ getHeight: () => 10, flex: 1 }),
      buildFakeChild({ getHeight: () => 80, flex: 1 })
    ];
    targetSize = { height: 100, width: 400 };
  });

  it('maxHeight', () => {
    const { meta } = layout.calculateChildBoxes(items, targetSize);
    expect(meta.maxHeight).toBe(80);
  });
});

describe('Ext.layout.HBoxLayout - update innerCt size', () => {
  let layout;
  let layoutTargetLastSize;
  let childBoxCache;

  beforeEach(() => {
    layout = buildLayout({ align: 'stretch', padding: { top: 10, bottom: 20, left: 0, right: 0 } });
    layoutTargetLastSize = { width: 400, height: 100 };
    childBoxCache = { meta: { maxHeight: 150 } };
  });

  it('maintains height for align stretch', () => {
    let width;
    let height;
    layout.innerCt = { setSize: (w, h) => { width = w; height = h; } };
    layout.updateInnerCtSize(layoutTargetLastSize, childBoxCache);
    expect(width).toBe(400);
    expect(height).toBe(100);
  });

  it('increases height for align middle', () => {
    layout = buildLayout({ align: 'middle', padding: { top: 10, bottom: 20, left: 0, right: 0 } });
    let width;
    let height;
    layout.innerCt = { setSize: (w, h) => { width = w; height = h; } };
    layout.updateInnerCtSize(layoutTargetLastSize, childBoxCache);
    expect(width).toBe(400);
    expect(height).toBe(180);
  });
});
