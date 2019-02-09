

describe('babel-plugin-jsx-mi2', () => {
  var TRANS = {city:'City', name:'Name'};
  function t(code){
    return TRANS[code] || code;
  }

  it('translate deferred', () => {// because wrapped in template tag
    let vnode = render(h => <template><div attr={t('city')}>{t('name')}</div></template>)
    vnode = vnode.children[0];
    expect(vnode.tag).toEqual('div')
    // translated upon evaluation of the function
    expect(vnode.children[0]).toEqual('Name')
    expect(vnode.attr.attr).toEqual('City')
  })

  it('translate immediate', () => {
    const vnode = render(h => <div attr={t('city')}>{t('name')}</div>)
    expect(vnode.tag).toEqual('div')

    // translated immediately by calling t('name') inline
    expect(vnode.children[0]).toEqual('Name')
    expect(vnode.attr.attr).toEqual('City')
  })

  function render(callback){
    return callback(createElement);
  }

  function createElement(tag, attr, ...children){
    return {tag, attr, children};
  }

})

