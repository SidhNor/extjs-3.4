/**
 * Vitest tests for Ext.layout.VBoxLayout
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

  return new Ext.layout.VBoxLayout(config);
}

describe('Ext.layout.VBoxLayout - calculating flexed box sizes', () => {
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
    targetSize = { height: 400, width: 100 };
  });

  it('equal flex heights', () => {
    const { boxes } = layout.calculateChildBoxes(items, targetSize);
    expect(boxes[0].height).toBe(100);
    expect(boxes[1].height).toBe(100);
    expect(boxes[2].height).toBe(100);
    expect(boxes[3].height).toBe(100);
  });

  it('different flex heights', () => {
    items = [
      buildFakeChild({ flex: 1 }),
      buildFakeChild({ flex: 2 }),
      buildFakeChild({ flex: 3 }),
      buildFakeChild({ flex: 4 })
    ];
    const { boxes } = layout.calculateChildBoxes(items, targetSize);
    expect(boxes[0].height).toBe(40);
    expect(boxes[1].height).toBe(80);
    expect(boxes[2].height).toBe(120);
    expect(boxes[3].height).toBe(160);
  });

  it('margins accounted for', () => {
    const itemsWithMargins = [
      buildFakeChild({ flex: 1, margins: { top: 10, bottom: 10, left: 0, right: 0 } }),
      buildFakeChild({ flex: 1, margins: { top: 10, bottom: 10, left: 0, right: 0 } }),
      buildFakeChild({ flex: 1, margins: { top: 10, bottom: 10, left: 0, right: 0 } }),
      buildFakeChild({ flex: 1, margins: { top: 10, bottom: 10, left: 0, right: 0 } })
    ];
    const { boxes } = layout.calculateChildBoxes(itemsWithMargins, targetSize);
    expect(boxes[0].height).toBe(80);
    expect(boxes[1].height).toBe(80);
    expect(boxes[2].height).toBe(80);
    expect(boxes[3].height).toBe(80);
  });

  it('padding accounted for', () => {
    layout = buildLayout({ padding: { top: 10, right: 10, bottom: 10, left: 10 } });
    const { boxes } = layout.calculateChildBoxes(items, targetSize);
    expect(boxes[0].height).toBe(95);
    expect(boxes[1].height).toBe(95);
    expect(boxes[2].height).toBe(95);
    expect(boxes[3].height).toBe(95);
  });

  it('height dominates flex', () => {
    const itemsWithHeight = [
      buildFakeChild({ flex: 1, height: 250, getHeight: () => 250 }),
      buildFakeChild({ flex: 1 }),
      buildFakeChild({ flex: 1 }),
      buildFakeChild({ flex: 1 })
    ];
    const { boxes } = layout.calculateChildBoxes(itemsWithHeight, targetSize);
    expect(boxes[0].height).toBe(250);
    expect(boxes[1].height).toBe(50);
    expect(boxes[2].height).toBe(50);
    expect(boxes[3].height).toBe(50);
  });

  it('height property dominates getHeight', () => {
    const layout2 = buildLayout({ pack: 'start', align: 'stretch' });
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
        height: 100,
        html: 'height : 100',
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
    const { boxes } = layout2.calculateChildBoxes(itemsWithProps, targetSize);
    expect(boxes[0].top).toBe(0);
    expect(boxes[1].top).toBe(100);
    expect(boxes[2].top).toBe(200);
  });
});

describe('Ext.layout.VBoxLayout - minHeight of items', () => {
  let layout;
  let items;

  beforeEach(() => {
    layout = buildLayout();
    layout.beforeCt = { getWidth: () => 0, createChild: Ext.emptyFn };
    layout.afterCt = { getWidth: () => 0, createChild: Ext.emptyFn };
    items = [
      buildFakeChild({ height: 100, minHeight: 100 }),
      buildFakeChild({ height: 200, minHeight: 120 }),
      buildFakeChild({ height: 200, minHeight: 120 }),
      buildFakeChild({ height: 200, minHeight: 120 })
    ];
  });

  it('available height is sufficient', () => {
    const targetSize = { height: 700, width: 25 };
    const { boxes } = layout.calculateChildBoxes(items, targetSize);
    expect(boxes[0].top).toBe(0);
    expect(boxes[1].top).toBe(100);
    expect(boxes[2].top).toBe(300);
    expect(boxes[3].top).toBe(500);

    expect(boxes[0].height).toBe(100);
    expect(boxes[1].height).toBe(200);
    expect(boxes[2].height).toBe(200);
    expect(boxes[3].height).toBe(200);
  });

  it('has shortfall', () => {
    const targetSize = { height: 500, width: 25 };
    const { boxes } = layout.calculateChildBoxes(items, targetSize);
    expect(boxes[0].height).toBe(100);
    expect(boxes[1].height).toBe(134);
    expect(boxes[2].height).toBe(133);
    expect(boxes[3].height).toBe(133);

    expect(boxes[0].top).toBe(0);
    expect(boxes[1].top).toBe(100);
    expect(boxes[2].top).toBe(234);
    expect(boxes[3].top).toBe(367);
  });

  it('too narrow', () => {
    const targetSize = { height: 400, width: 25 };
    const { boxes } = layout.calculateChildBoxes(items, targetSize);
    expect(boxes[0].top).toBe(0);
    expect(boxes[1].top).toBe(100);
    expect(boxes[2].top).toBe(220);
    expect(boxes[3].top).toBe(340);

    expect(boxes[0].height).toBe(100);
    expect(boxes[1].height).toBe(120);
    expect(boxes[2].height).toBe(120);
    expect(boxes[3].height).toBe(120);
  });
});

describe('Ext.layout.VBoxLayout - aligning', () => {
  let layout;
  let items;
  let targetSize;

  beforeEach(() => {
    items = [
      buildFakeChild({ flex: 1, getWidth: () => 10 }),
      buildFakeChild({ flex: 1, getWidth: () => 20 }),
      buildFakeChild({ flex: 1, getWidth: () => 30 }),
      buildFakeChild({ flex: 1, getWidth: () => 40 })
    ];
    targetSize = { height: 400, width: 100 };
  });

  it('left align', () => {
    layout = buildLayout({ align: 'left' });
    const { boxes } = layout.calculateChildBoxes(items, targetSize);
    expect(boxes[0].left).toBe(0);
    expect(boxes[1].left).toBe(0);
    expect(boxes[2].left).toBe(0);
    expect(boxes[3].left).toBe(0);
  });

  it('center align', () => {
    layout = buildLayout({ align: 'center' });
    const { boxes } = layout.calculateChildBoxes(items, targetSize);
    expect(boxes[0].left).toBe(45);
    expect(boxes[1].left).toBe(40);
    expect(boxes[2].left).toBe(35);
    expect(boxes[3].left).toBe(30);
  });

  it('stretch align', () => {
    layout = buildLayout({ align: 'stretch' });
    const { boxes } = layout.calculateChildBoxes(items, targetSize);
    expect(boxes[0].left).toBe(0);
    expect(boxes[1].left).toBe(0);
    expect(boxes[2].left).toBe(0);
    expect(boxes[3].left).toBe(0);

    expect(boxes[0].width).toBe(100);
    expect(boxes[1].width).toBe(100);
    expect(boxes[2].width).toBe(100);
    expect(boxes[3].width).toBe(100);
  });

  it('stretchmax align', () => {
    layout = buildLayout({ align: 'stretchmax' });
    const { boxes } = layout.calculateChildBoxes(items, targetSize);
    expect(boxes[0].left).toBe(0);
    expect(boxes[1].left).toBe(0);
    expect(boxes[2].left).toBe(0);
    expect(boxes[3].left).toBe(0);

    expect(boxes[0].width).toBe(40);
    expect(boxes[1].width).toBe(40);
    expect(boxes[2].width).toBe(40);
    expect(boxes[3].width).toBe(40);
  });
});

describe('Ext.layout.VBoxLayout - packing', () => {
  let layout;
  let items;
  let targetSize;

  beforeEach(() => {
    items = [
      buildFakeChild({ getSize: () => ({ width: 10, height: 10 }) }),
      buildFakeChild({ getSize: () => ({ width: 10, height: 20 }) }),
      buildFakeChild({ getSize: () => ({ width: 10, height: 30 }) }),
      buildFakeChild({ getSize: () => ({ width: 10, height: 40 }) })
    ];
    targetSize = { height: 400, width: 100 };
  });

  it('pack start', () => {
    layout = buildLayout({ pack: 'start' });
    const { boxes } = layout.calculateChildBoxes(items, targetSize);
    expect(boxes[0].top).toBe(0);
    expect(boxes[1].top).toBe(10);
    expect(boxes[2].top).toBe(30);
    expect(boxes[3].top).toBe(60);
  });

  it('pack center', () => {
    layout = buildLayout({ pack: 'center' });
    const { boxes } = layout.calculateChildBoxes(items, targetSize);
    expect(boxes[0].top).toBe(150);
    expect(boxes[1].top).toBe(160);
    expect(boxes[2].top).toBe(180);
    expect(boxes[3].top).toBe(210);
  });

  it('pack end', () => {
    layout = buildLayout({ pack: 'end' });
    const { boxes } = layout.calculateChildBoxes(items, targetSize);
    expect(boxes[0].top).toBe(300);
    expect(boxes[1].top).toBe(310);
    expect(boxes[2].top).toBe(330);
    expect(boxes[3].top).toBe(360);
  });
});

describe('Ext.layout.VBoxLayout - meta data from calculated box sizes', () => {
  let layout;
  let items;
  let targetSize;

  beforeEach(() => {
    layout = buildLayout();
    items = [
      buildFakeChild({ getWidth: () => 50, flex: 1 }),
      buildFakeChild({ getWidth: () => 60, flex: 1 }),
      buildFakeChild({ getWidth: () => 10, flex: 1 }),
      buildFakeChild({ getWidth: () => 80, flex: 1 })
    ];
    targetSize = { height: 400, width: 100 };
  });

  it('maxWidth', () => {
    const { meta } = layout.calculateChildBoxes(items, targetSize);
    expect(meta.maxWidth).toBe(80);
  });
});

describe('Ext.layout.VBoxLayout - update innerCt size', () => {
  let layout;
  let layoutTargetLastSize;
  let childBoxCache;

  beforeEach(() => {
    layout = buildLayout({ align: 'stretch', padding: { top: 0, bottom: 0, left: 10, right: 20 } });
    layoutTargetLastSize = { width: 100, height: 400 };
    childBoxCache = { meta: { maxWidth: 150 } };
  });

  it('maintains width for align stretch', () => {
    let width;
    let height;
    layout.innerCt = { setSize: (w, h) => { width = w; height = h; } };
    layout.updateInnerCtSize(layoutTargetLastSize, childBoxCache);
    expect(width).toBe(100);
    expect(height).toBe(400);
  });

  it('increases width for align middle', () => {
    layout = buildLayout({ align: 'middle', padding: { top: 0, bottom: 0, left: 10, right: 20 } });
    let width;
    let height;
    layout.innerCt = { setSize: (w, h) => { width = w; height = h; } };
    layout.updateInnerCtSize(layoutTargetLastSize, childBoxCache);
    expect(width).toBe(180);
    expect(height).toBe(400);
  });
});
