

describe('babel-plugin-jsx-mi2', () => {
  var TRANS = {city:'City', name:'Name'};
  function t(code){
    return TRANS[code] || code;
  }

  it('translate deferred', () => {// because global option in .babelrc
    const vnode = render(h => <div attr={t('city')}>{t('name')}</div>)
    expect(vnode.tag).toEqual('div')
    
    // translated upon evaluation of the function
    expect(vnode.children[0]()).toEqual('Name')
    expect(vnode.attr.attr()).toEqual('City')
  })

  it('should not wrap delcared function', () => {
    const vnode = render(h => <div>{function(){return 'test'}}</div>)
    expect(vnode.tag).toEqual('div')
    expect(vnode.children[0]()).toEqual('test')
  })

  it('should not wrap delcared arrow function', () => {
    const vnode = render(h => <div>{()=>{return 'test2'}}</div>)
    expect(vnode.tag).toEqual('div')
    expect(vnode.children[0]()).toEqual('test2')
  })

  it('should contain text', () => {
    const vnode = render(h => <div>test</div>)
    expect(vnode.tag).toEqual('div')
    expect(vnode.children[0]).toEqual('test')
  })

  it('should spread attribs', () => {
    const sth = {name:'Joe'};
    const vnode = render(h => <div {...sth}>test</div>)
    
    expect(vnode.tag).toEqual('div')
    expect(vnode.children[0]).toEqual('test')
    expect(vnode.attr.name).toEqual('Joe')
  })

  it('should spread and combine attribs', () => {
    const v1 = {name:'Joe1', city:'Mordor'};
    const $href= '#';
    const v2 = {name:'Joe2'};

    const vnode = render(h => <div {...v1} href={$href} id="myId" {...v2}></div>)

    expect(vnode.tag).toEqual('div')
    expect(vnode.attr.name).toEqual('Joe2')
    expect(vnode.attr.href).toEqual('#')
    expect(vnode.attr.id).toEqual('myId')
    expect(vnode.attr.city).toEqual('Mordor')
  })

  function render(callback){
    return callback(createElement);
  }

  function createElement(tag, attr, ...children){
    return {tag, attr, children};
  }

})

