describe('Ext.layout.ContainerLayout - parseMargins', () => {
  let layout;

  beforeEach(() => {
    layout = new Ext.layout.ContainerLayout();
  });

  it('parses number margins', () => {
    const res = layout.parseMargins(10);
    expect(res).toEqual({ top: 10, right: 10, bottom: 10, left: 10 });
  });

  it('parses string with 1 value', () => {
    const res = layout.parseMargins('10');
    expect(res).toEqual({ top: 10, right: 10, bottom: 10, left: 10 });
  });

  it('parses string with 2 values', () => {
    const res = layout.parseMargins('10 5');
    expect(res).toEqual({ top: 10, right: 5, bottom: 10, left: 5 });
  });

  it('parses string with 3 values', () => {
    const res = layout.parseMargins('10 5 2');
    expect(res).toEqual({ top: 10, right: 5, bottom: 2, left: 5 });
  });

  it('parses string with 4 values', () => {
    const res = layout.parseMargins('10 5 2 1');
    expect(res).toEqual({ top: 10, right: 5, bottom: 2, left: 1 });
  });
});

describe('Ext.layout.ContainerLayout - configureItem', () => {
  let layout;
  let component;

  beforeEach(() => {
    layout = new Ext.layout.ContainerLayout({ extraCls: 'myExtraClass' });

    component = {
      addClass: vi.fn(),
      doLayout: vi.fn()
    };
  });

  it('adds extraCls via addClass', () => {
    const mockCmp = {
      addClass: vi.fn()
    };

    layout.configureItem(mockCmp, 0);
    expect(mockCmp.addClass).toHaveBeenCalledWith('myExtraClass');
  });

  it('adds extraCls to getPositionEl', () => {
    const mockPosEl = {
      addClass: vi.fn()
    };

    const mockCmp = {
      getPositionEl: () => mockPosEl
    };

    layout.configureItem(mockCmp, 0);
    expect(mockPosEl.addClass).toHaveBeenCalledWith('myExtraClass');
  });

  it('forces doLayout if forceLayout is true', () => {
    layout.forceLayout = true;

    layout.configureItem(component, 0);
    expect(component.doLayout).toHaveBeenCalled();
  });

  it('does not call doLayout if forceLayout is false', () => {
    layout.forceLayout = false;

    layout.configureItem(component, 0);
    expect(component.doLayout).not.toHaveBeenCalled();
  });
});
