const Users = require('./data/users');
const Goods = require('./data/goods');
const Manufactures = require('./data/manufactures');
const Personals = require('./data/personal');
const Baskets = require('./data/basket');
const {
    GraphQLObjectType,
    GraphQLString,
    GraphQLList,
    GraphQLNonNull,
    GraphQLID,
    GraphQLInt,
    GraphQLSchema,
    GraphQLEnumType
    } = require('graphql');



const manufactureType = new GraphQLObjectType({
    name: 'Manufacture',
    description: 'Manufacture of products in our shop',
    fields: {
        id: {type: GraphQLNonNull(GraphQLID)},
        name: {type: GraphQLNonNull(GraphQLString)},
        description: {type: GraphQLNonNull(GraphQLString)},
        address: {type: GraphQLNonNull(GraphQLString)},
        telephone: {type: GraphQLNonNull(GraphQLString)},
        email: {type: GraphQLNonNull(GraphQLString)},
        website: {type: GraphQLNonNull(GraphQLString)}
    }
});

const goodType = new GraphQLObjectType({
    name: 'Good',
    fields: {
        id: {type: GraphQLNonNull(GraphQLID)},
        name: {type: GraphQLNonNull(GraphQLString)},
        description: {type: GraphQLNonNull(GraphQLString)},
        rating: {type: GraphQLNonNull(GraphQLString)},
        cost: {type: GraphQLNonNull(GraphQLInt)},
        currency: {type: GraphQLNonNull(GraphQLString)},
        manufacture: {
            type: manufactureType,
            resolve: (parent, args) => {
                return Manufactures.find(manufacture => manufacture.id == parent.manufactureId);
            }
        }
    }
});

const userType = new GraphQLObjectType({
    name: 'User',
    description: 'This type for user of our e-commerce shop',
    fields: {
        id: { type: GraphQLNonNull(GraphQLID)},
        name: {type: GraphQLNonNull(GraphQLString)},
        email: {type: GraphQLNonNull(GraphQLString)},
        phone: {type: GraphQLNonNull(GraphQLString)},
        wishList: {
            type: new GraphQLList(goodType),
            description: 'List of wishes goods by user',
            resolve: (parent, args) => {
                return Goods.filter( good => {
                    for (const id of parent.wishList) {
                        if (good.id == id) {
                            return good;
                        }
                    }
                });
            }
        }
    }
});
const personalType = new GraphQLObjectType({
    name: 'Employee',
    description: 'Team of support for our E-commerce shop',
    fields: {
        id: { type: GraphQLNonNull(GraphQLID)},
        name: {type: GraphQLNonNull(GraphQLString)},
        description: {type: GraphQLNonNull(GraphQLString)},
        position: {type: GraphQLNonNull(GraphQLString)},
        telephone: {type: GraphQLNonNull(GraphQLString)},
        email: {type: GraphQLNonNull(GraphQLString)}
    }
});

const basketInfoOutput = new GraphQLObjectType({
    name: 'Info',
    description: 'info about goods and these amount in user basket',
    fields: () => ({
        id: {type: GraphQLNonNull(GraphQLID)},
        name: {type: GraphQLNonNull(GraphQLString)},
        description: {type: GraphQLNonNull(GraphQLString)},
        rating: {type: GraphQLNonNull(GraphQLString)},
        cost: {type: GraphQLNonNull(GraphQLInt)},
        currency: {type: GraphQLNonNull(GraphQLString)},
        manufacture: {
            type: manufactureType,
            resolve: (parent, args) => {
                return Manufactures.find(manufacture => manufacture.id == parent.manufactureId);
            }
        },
        amount: {type: GraphQLInt}
    })
})

const basketType = new GraphQLObjectType({
    name: 'Shopping_basket',
    description: 'Shopping basket of customers of our shop',
    fields: () => ({
        id: { type: GraphQLID},
        user: {
            type: userType,
            resolve: (parent, args) => {
                return Users.find(user => user.id == parent.userId);
            }
        },
        goods: {
            // TODO как равильно наследовать классы???
            type: new GraphQLList(basketInfoOutput),
            description: 'List of all goods user basket',
            resolve: (parent, args) => {
                return Goods.filter(good => {
                    for (const goodInfo of parent.goodsInBasket) {
                        if (good.id == goodInfo.goodId) {
                            return {
                                id: good.id,
                                name: good.name,
                                description: good.description,
                                rating: good.rating,
                                cost: good.cost,
                                currency: good.currency,
                                manufacture: good.manufacture,
                                amount: goodInfo.amount
                            }
                        }
                    }
                })
            }
        }

    })
});




const ECommerceQuery = new GraphQLObjectType({
    name: 'Query',
    description: 'Schema Query',
    fields: () => ({
        goods: {
            type: new GraphQLList(goodType),
            description: 'List of all Goods',
            resolve: () => {
                return Goods;
            }
        },
        good: {
            type: goodType,
            args: {id: {type: GraphQLID}},
            resolve: (parent, args) => {
                return Goods.find(good => good.id === args.id)
            }
        },
        users: {
            type: new GraphQLList(userType),
            description: 'List of all Users',
            resolve: () => {
                return Users;
            }
        },
        user: {
            type: userType,
            args: {id: {type: GraphQLID}},
            resolve: (parent, args) => {
                return Users.find(user => user.id === args.id);
            }
        },
        manufactures: {
            type: new GraphQLList(manufactureType),
            description: 'List of all Manufactures',
            resolve: () => {
                return Manufactures;
            }
        },
        manufacture: {
            type: manufactureType,
            args: {id : {type: GraphQLID}},
            resolve: (parent, args) => {
                return Manufactures.find(manufacture => manufacture.id == args.id);
            }
        },
        personals: {
            type: new GraphQLList(personalType),
            description: 'List of all Personals',
            resolve: () => {
                return Personals;
            }
        },
        personal: {
            type: personalType,
            args: {id: {type: GraphQLID}},
            resolve: (parent, args) => {
                return Personals.find(personal => personal.id == args.id);
            }
        },
        baskets: {
            type: new GraphQLList(basketType),
            description: 'List of all Users Basket',
            resolve: () => {
                return Baskets;
            }
        },
        basket: {
            type: basketType,
            args: {id: {type: GraphQLID}},
            resolve: (parent, args) => {
                return Baskets.find(bask => bask.id === args.id);
            }
        }

    })
});


const ECommerceMutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: () => ({
        addGood: {
            type: goodType,
            description: 'Add new good entity',
            args:{
                id: {type: GraphQLID},
                name: {type: GraphQLString},
                description: {type: GraphQLString},
                rating: {type: GraphQLString},
                cost: {type: GraphQLInt},
                currency: {type: GraphQLString},
                manufactureId: {type: GraphQLID}
            },
            resolve: (parent, args) => {
                Goods.push({
                    id: args.id,
                    name: args.name,
                    description: args.description,
                    rating: args.rating,
                    cost: args.cost,
                    manufactureId: args.manufactureId
                });
                return Goods;
            }
        },
        deleteGood: {
            type: goodType,
            description: 'Delete good entity by id',
            args: { id: {type: GraphQLID}},
            resolve: (parent, args) => {
                return  Goods.filter(good => good.id != args.id);
            }
        },
        createUser: {
            type: userType,
            description: 'Add new user to our ECommerce shop',
            args: {
                id: { type: GraphQLNonNull(GraphQLID)},
                name: {type: GraphQLNonNull(GraphQLString)},
                email: {type: GraphQLNonNull(GraphQLString)},
                phone: {type: GraphQLNonNull(GraphQLString)},
            },
            resolve: (parent, args) => {
              return   Users.push({id: args.id, name: args.name, email: args.email, phone: args.phone});
            }
        },
        updateUser: {
            type: userType,
            description: 'Update info about our ECommerce user',
            args: {
                id: { type: GraphQLNonNull(GraphQLID)},
                name: {type: GraphQLNonNull(GraphQLString)},
                email: {type: GraphQLNonNull(GraphQLString)},
                phone: {type: GraphQLNonNull(GraphQLString)},
            },
            resolve: (parent, args) => {
                const user = Users.find(user => user.id == args.id);
                Users.splice({id: args.id}, 1);
                user.name = args.name;
                user.email = args.email;
                user.phone = arg.phone;
                Users.push(user);
                return user;
            }
        }
    })
});

module.exports = new GraphQLSchema({
    query: ECommerceQuery,
    mutation: ECommerceMutation
});
