"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
/* eslint-disable max-classes-per-file */
const ApiDefinition_1 = require("./ApiDefinition");
describe('@ApiDefinition', () => {
    it('undecorated', () => {
        class Test {
        }
        expect(ApiDefinition_1.getApiDefinition(Test)).toBeUndefined();
    });
    it('abstract class', () => {
        let Test = class Test {
        };
        Test = tslib_1.__decorate([
            ApiDefinition_1.ApiDefinition('abstract-class')
        ], Test);
        expect(ApiDefinition_1.getApiDefinition(Test)).toEqual('abstract-class');
    });
    it('concrete class', () => {
        let Test = class Test {
        };
        Test = tslib_1.__decorate([
            ApiDefinition_1.ApiDefinition('concrete-class')
        ], Test);
        expect(ApiDefinition_1.getApiDefinition(Test)).toEqual('concrete-class');
    });
    it('name collision', () => {
        let Test = 
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        class Test {
        };
        Test = tslib_1.__decorate([
            ApiDefinition_1.ApiDefinition('collision-class')
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        ], Test);
        expect(() => {
            let Test2 = 
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            class Test2 {
            };
            Test2 = tslib_1.__decorate([
                ApiDefinition_1.ApiDefinition('collision-class')
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
            ], Test2);
        }).toThrowError(`Api definition already exists for the name 'collision-class'.`);
    });
    it('multiple on one target', () => {
        expect(() => {
            let Test = 
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            class Test {
            };
            Test = tslib_1.__decorate([
                ApiDefinition_1.ApiDefinition('class-1'),
                ApiDefinition_1.ApiDefinition('class-2')
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
            ], Test);
        }).toThrowError('Target already decorated with an @ApiDefintion');
    });
});
//# sourceMappingURL=ApiDefinition.test.js.map