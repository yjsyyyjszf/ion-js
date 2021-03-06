/*!
 * Copyright 2012 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  
 * Licensed under the Apache License, Version 2.0 (the "License").
 * You may not use this file except in compliance with the License.
 * A copy of the License is located at
 *  
 *     http://www.apache.org/licenses/LICENSE-2.0
 *  
 * or in the "license" file accompanying this file. This file is distributed
 * on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 * express or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */

import {assert} from 'chai';
import * as ion from '../src/Ion';

describe('Binary Reader', () => {
    it('timestamp', () => {
        let timestamp = ion.Timestamp.parse('2000-05-04T03:02:01.000789000Z');
        let writer = ion.makeBinaryWriter();
        writer.writeTimestamp(timestamp);
        writer.close();
        let reader = ion.makeReader(writer.getBytes());
        reader.next();
        assert.deepEqual(reader.timestampValue(), timestamp);
    });
    it('test position', () => {
        // In the comments below, the vertical bar '|' indicates the current position of the cursor at each step.
        const ionBinary: Uint8Array = ion.dumpBinary(null, 7, -17, "Hello", [1, 2, 3]);
        // [|0xE0, 0x1, 0x0, 0xEA, |0xF, |0x21, 0x7, |0x31, 0x11, |0x85, 0x48, 0x65, 0x6C, 0x6C, 0x6F, |0xB6, 0x21, 0x1, 0x21, 0x2, 0x21, 0x3 |]
        //   Version                null  7           -17          "hello"                              [1,2,3]
        const binaryReader = ion.makeReader(ionBinary);
        // init pos 0
        // [|0xE0, 0x1, 0x0, 0xEA, 0xF, 0x21, 0x7, 0x31, 0x11, 0x85, 0x48, 0x65, 0x6C, 0x6C, 0x6F, 0xB6, 0x21, 0x1, 0x21, 0x2, 0x21, 0x3]
        assert.equal(binaryReader.position(), 0);
        binaryReader.next();
        // at null
        // [0xE0, 0x1, 0x0, 0xEA, 0xF,| 0x21, 0x7, 0x31, 0x11, 0x85, 0x48, 0x65, 0x6C, 0x6C, 0x6F, 0xB6, 0x21, 0x1, 0x21, 0x2, 0x21, 0x3]
        assert.equal(binaryReader.position(), 5);
        binaryReader.next();
        // at 7
        // [0xE0, 0x1, 0x0, 0xEA, 0xF, 0x21, 0x7,| 0x31, 0x11, 0x85, 0x48, 0x65, 0x6C, 0x6C, 0x6F, 0xB6, 0x21, 0x1, 0x21, 0x2, 0x21, 0x3]
        assert.equal(binaryReader.position(), 6);
        binaryReader.next();
        // at 17
        // [0xE0, 0x1, 0x0, 0xEA, 0xF, 0x21, 0x7, 0x31, 0x11,| 0x85, 0x48, 0x65, 0x6C, 0x6C, 0x6F, 0xB6, 0x21, 0x1, 0x21, 0x2, 0x21, 0x3]
        assert.equal(binaryReader.position(), 8);
        binaryReader.next();
        // at hello
        // [0xE0, 0x1, 0x0, 0xEA, 0xF, 0x21, 0x7, 0x31, 0x11, 0x85, 0x48,| 0x65, 0x6C, 0x6C, 0x6F, 0xB6, 0x21, 0x1, 0x21, 0x2, 0x21, 0x3]
        assert.equal(binaryReader.position(), 10);
        binaryReader.next();
        // at [1,2,3] 
        // [0xE0, 0x1, 0x0, 0xEA, 0xF, 0x21, 0x7, 0x31, 0x11, 0x85, 0x48, 0x65, 0x6C, 0x6C, 0x6F, 0xB6, 0x21,| 0x1, 0x21, 0x2, 0x21, 0x3]
        assert.equal(binaryReader.position(), 16);
        binaryReader.stepIn();
        binaryReader.next();
        // at 1
        // [0xE0, 0x1, 0x0, 0xEA, 0xF, 0x21, 0x7, 0x31, 0x11, 0x85, 0x48, 0x65, 0x6C, 0x6C, 0x6F, 0xB6, 0x21, 0x1,| 0x21, 0x2, 0x21, 0x3]
        assert.equal(binaryReader.position(), 17);
        binaryReader.next();
        // at 2
        // [0xE0, 0x1, 0x0, 0xEA, 0xF, 0x21, 0x7, 0x31, 0x11, 0x85, 0x48, 0x65, 0x6C, 0x6C, 0x6F, 0xB6, 0x21, 0x1, 0x21, 0x2,| 0x21, 0x3]
        assert.equal(binaryReader.position(), 19);
        binaryReader.next();
        // at 3
        // [0xE0, 0x1, 0x0, 0xEA, 0xF, 0x21, 0x7, 0x31, 0x11, 0x85, 0x48, 0x65, 0x6C, 0x6C, 0x6F, 0xB6, 0x21, 0x1, 0x21, 0x2, 0x21, 0x3|]
        assert.equal(binaryReader.position(), 21);
        binaryReader.stepOut();
        // out of stream
        // [0xE0, 0x1, 0x0, 0xEA, 0xF, 0x21, 0x7, 0x31, 0x11, 0x85, 0x48, 0x65, 0x6C, 0x6C, 0x6F, 0xB6, 0x21, 0x1, 0x21, 0x2, 0x21, 0x3]|
        assert.equal(binaryReader.position(), 22);
    });
});
