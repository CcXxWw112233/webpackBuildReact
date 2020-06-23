import React, { Component } from 'react'
import PropTypes from 'prop-types'
// https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Inheritance_and_the_prototype_chain 参考自
export default class ObjectProto extends Component {

    constructor(props) {
        super(props)
        this.funcTest()
        // this.extendsTest()
        // this.classTest()
    }

    funcTest = () => {
        let Func = function () {
            this.a = 1;
            this.b = 2;
        }

        let o = new Func(); // {a: 1, b: 2}
        // 在f函数的原型上定义属性
        Func.prototype.b = 3;
        Func.prototype.c = 4;
        Func.prototype.alarm = function () {
            console.log('dddddd_0', this.b)
        }
        o.alarm()
        const b = Object.create(o)
        b.b = 99
        b.alarm()
        console.log('dddddd_1', o.constructor == Func.prototype.constructor) //对象的构造器指向构造函数， 构造函数的proptotype.constructor指向他本身
        console.log('dddddd_2', { o, o_proto: o.__proto__, Func_prototype: Func.prototype, Func_proto: Func.__proto__, })
        console.log('dddddd_3', { Func_proto: Func.__proto__, })

    }

    extendsTest = () => {
        const o = {
            a: 2,
            m: function () {
                return this.a + 1
            }
        }
        console.log('dddddddddd', o.m())
        const p = Object.create(o)
        p.a = 4
        console.log('dddddddddd', p.m())
    }

    classTest = () => {
        class Polygon {
            constructor(props) {
                const { height, width } = props
                console.log('ddddddddddd0', props)
                this.height = height;
                this.width = width;
            }
        }
        class Square extends Polygon {
            constructor(props) {
                super(props);
                console.log('ddddddddddd1', props)
            }
            get area() {
                return this.height * this.width;
            }
            set sideLength(newLength) {
                this.height = newLength;
                this.width = newLength;
            }
        }

        var square = new Square({ height: 2, width: 2, d: 4 });
        square.sideLength = 4
        console.log('dddddddd', square.area)
        var square2 = new Square({ height: 2, width: 2, d: 3 });
        console.log('dddddddd2', square2.area)
    }

    newObjProcess = () => {
        const Foo = function () {

        }
        var o = new Foo();
        // 分解new 一个对象的过程
        // var o = new Object();
        // o.__proto__ = Foo.prototype;
        // Foo.call(o);
    }
    render() {

        return (
            <div>

            </div>
        )
    }
}
