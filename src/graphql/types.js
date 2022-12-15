const { GraphQLScalarType } = require('graphql');
const { Kind } = require('graphql');
const { GraphQLInputObjectType, GraphQLList, GraphQLNonNull, GraphQLString, GraphQLInt, GraphQLEnumType } = require('graphql');
const { DatePattern } = require('../utils/regexp-patterns');
const { parseToSafeInteger } = require('../utils/util');

function choiceType(value) {
    try {
        return parseToSafeInteger(value);
    } catch(err) {
        return `${value}`;
    }
}

const GQLScalar_IntOrString = new GraphQLScalarType({
    name: 'IntOrString',
    serialize: choiceType,
    parseValue: choiceType,
    parseLiteral(ast) {
        if(ast.kind === Kind.INT) {
            return parseToSafeInteger(ast.value);
        } else if(ast.kind === Kind.STRING) {
            return `${ast.value}`;
        }
        return null;
    }
})

const GQLScalar_Date = new GraphQLScalarType({
    name: 'Date',
    serialize(value) {
        return value?.toISOString();
    },
    parseValue(value) {
        return new Date(value);
    },
    parseLiteral(ast) {
        if(ast.kind === Kind.STRING && DatePattern.test(ast.value))
            return new Date(ast.value);
        return null;
    }
})

const GQLScalar_Hybrid = new GraphQLScalarType({
    name: 'Hybrid',
    description: 'A Integer, String or Date type',
    serialize(value) {
        if(value instanceof Date)
            return value.toISOString();
        else
            return value;
    },
    parseValue(value) {
        if(DatePattern.test(value))
            return new Date(value);
        return value;
    },
    parseLiteral(ast) {
        if(ast.kind === Kind.INT)
            return parseInt(ast.value, 10);
        else if(ast.kind === Kind.STRING) {
            if(DatePattern.test(ast.value))
                return new Date(ast.value);
            return ast.value;
        }
        return null;
    }
})

const GQLEnum_SortOrder = new GraphQLEnumType({
    name: 'SortOrder',
    values: {
        ASC: { value: 'ASC' },
        DESC: { value: 'DESC' }
    }
})

const GQLInput_OrderBy = new GraphQLInputObjectType({
    name: 'OrderBy',
    fields: () => ({
        field: { type: GraphQLString },
        order: {
            type: GQLEnum_SortOrder,
            defaultValue: GQLEnum_SortOrder.getValue('ASC')
        }
    })
});

const GQLEnum_LogicalOperator = new GraphQLEnumType({
    name: 'LogicalOperator',
    values: {
        AND: { value: 'and' },
        OR: { value: 'or' }
    }
})

const GQLEnum_RelationalOperator = new GraphQLEnumType({
    name: 'RelationalOperator',
    values: {
        EQUAL: { value: '==' },
        N_EQUAL: { value: '!=' },
        LESS: { value: '<' },
        LESS_EQUAL: { value: '<=' },
        BIG: { value: '>' },
        BIG_EQUAL: { value: '>=' },
        START: { value: '^=' },
        END: { value: '$=' },
        CONTAINS: { value: '*=' },
    }
})

const GQLInput_ConditionLeaf = new GraphQLInputObjectType({
    name: 'ConditionLeafInput',
    fields: () => ({
        field: { type: new GraphQLNonNull(GraphQLString) },
        operator: { type: new GraphQLNonNull(GQLEnum_RelationalOperator) },
        value: { type: GQLScalar_Hybrid }
    })
})

const GQLInput_Condition = new GraphQLInputObjectType({
    name: 'ConditionInput',
    fields: () => ({
        operator: { type: GQLEnum_LogicalOperator },
        grouping: { type: new GraphQLList(GQLInput_Condition) },
        condition: { type: GQLInput_ConditionLeaf }
    })
})

module.exports = {
    GQLInput_OrderBy,
    GQLInput_Condition,
    GQLScalar_Date,
    GQLScalar_Hybrid
}
