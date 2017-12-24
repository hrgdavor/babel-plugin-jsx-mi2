

describe('babel-plugin-jsx-mi2', () => {
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

