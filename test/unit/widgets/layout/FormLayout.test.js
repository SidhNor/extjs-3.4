describe('Ext.layout.FormLayout - getTemplateArgs', () => {
  let layout;
  let field1, field2, field3;
  let args1, args2, args3;

  function buildLayout(config) {
    const layout = new Ext.layout.FormLayout(config || {});
    layout.container = {
      itemCls: 'ctCls'
    };
    return layout;
  }

  beforeEach(() => {
    layout = buildLayout({
      labelStyle: 'color: red;',
      elementStyle: 'padding-left:0;'
    });

    field1 = {
      id: 'myField',
      itemCls: 'myCls',
      clearCls: 'myClearCls',
      fieldLabel: 'A Label',
      labelStyle: 'border-top: 10px;'
    };

    field2 = {
      id: 'myField2',
      fieldLabel: 'My Label',
      labelSeparator: '@'
    };

    field3 = Ext.apply({}, {
      fieldLabel: 'Third label',
      hideLabel: true
    }, field2);

    args1 = layout.getTemplateArgs(field1);
    args2 = layout.getTemplateArgs(field2);
    args3 = layout.getTemplateArgs(field3);
  });

  it('returns correct id', () => {
    expect(args1.id).toBe('myField');
    expect(args2.id).toBe('myField2');
  });

  it('returns correct label', () => {
    expect(args1.label).toBe('A Label');
    expect(args2.label).toBe('My Label');
    expect(args3.label).toBe('Third label');
  });

  it('combines labelStyle from layout and field', () => {
    expect(args1.labelStyle).toBe('color: red;border-top: 10px;');
  });

  it('returns correct elementStyle', () => {
    expect(args1.elementStyle).toBe('padding-left:0;');
  });

  it('handles labelSeparator correctly', () => {
    expect(args1.labelSeparator).toBe(':');
    expect(args2.labelSeparator).toBe('@');
    expect(args3.labelSeparator).toBe('');
  });

  it('returns correct itemCls', () => {
    expect(args1.itemCls).toBe('myCls');
    expect(args2.itemCls).toBe('ctCls');
    expect(args3.itemCls).toBe('ctCls x-hide-label');
  });

  it('returns correct clearCls', () => {
    expect(args1.clearCls).toBe('myClearCls');
    expect(args2.clearCls).toBe('x-form-clear-left');
  });
});
