import React, { useState, useRef, useEffect } from 'react'
import PropTypes from 'prop-types'

// 参阅https://zh-hans.reactjs.org/blog/2020/05/22/react-hooks.html

// function HookTest(props) {
//     const [count, setCount] = useState(0)

//     const currentCount = useRef(count)
//     currentCount.current = count

//     const as = count

//     const handleClick = () => {
//         setTimeout(() => {
//             setCount(currentCount.current + 1);
//         }, 3000);
//     };
//     return (
//         <div>
//             <p>{count}</p>
//             <button onClick={() => setCount(count + 1)}>
//                 setCount
//             </button>
//             <button onClick={handleClick}>
//                 Delay setCount
//             </button>
//         </div>
//     )
// }

// function HookTest() {
//     const [count, setCount] = useState(1);

//     const prevCountRef = useRef(1);
//     const prevCount = prevCountRef.current;
//     prevCountRef.current = count;

//     const handleClick = () => {
//         setCount(prevCount + count);
//     };

//     return (
//         <div>
//             <p>{count}</p>
//             <button onClick={handleClick}>SetCount</button>
//         </div>
//     );
// }


function HookTest() {
    const [count, setCount] = useState(0);

    // useEffect(() => {
    //     setTimeout(() => {
    //         console.log(`You clicked ${count} times`);
    //     }, 3000);
    // });
    // useEffect(() => {
    //     const id = setInterval(() => {
    //         setCount(count => count + 1);
    //     }, 1000);
    //     return () => clearInterval(id);
    // }, [count]);

    // useEffect(() => {
    //     const id = setInterval(() => {
    //         console.log(count);
    //     }, 1000);
    //     return () => clearInterval(id);
    // }, []);

    const countRef = useRef();
    countRef.current = count;
    useEffect(() => {
        const id = setInterval(() => {
            console.log(countRef.current);
        }, 1000);
        return () => clearInterval(id);
    }, []);

    return (
        <div>
            <p>You clicked {count} times</p>
            <button onClick={() => setCount(count => count + 1)}>
                Click me
            </button>
        </div>
    );
}

HookTest.propTypes = {

}

export default HookTest

