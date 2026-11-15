const DB = require("../configs/database");
const { ConflictError } = require("../helpers/errors");

const getCollection = async () => (await DB.getDb()).collection("courses");

const init = async () => {
    const courses = await getCollection();
    await courses.createIndexes([
        { key: { href: 1 }, name: "unique_course_href", unique: true },
        { key: { category: 1 }, name: "courses_by_category" },
        { key: { creator: 1 }, name: "courses_by_creator" }
    ]);
};

const rethrowDuplicate = error => {
    if (error.code === 11000) {
        throw new ConflictError("A course with this href already exists.");
    }
    throw error;
};

const find = async ({ filter, sort, skip, limit }) => {
    const courses = await getCollection();
    return courses
        .find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .toArray();
};

const findById = async _id => {
    const courses = await getCollection();
    return courses.findOne({ _id });
};

const create = async (data) => {
    const courses = await getCollection();

    const course = {
        name: data.name,
        description: data.description,
        support: data.support,
        href: data.href,
        price: data.price,
        status: data.status,
        discount: data.discount,
        category: data.category,
        cover: data.cover,
        creator: data.creator,
        createdAt: new Date()
    };
    
    try {
        const { insertedId } = await courses.insertOne(course);
        return { ...course, _id: insertedId };
    } catch (error) {
        rethrowDuplicate(error);
    }
};

const update = async (_id, changes) => {
    const courses = await getCollection();
    try {
        return await courses.findOneAndUpdate(
            { _id },
            { $set: { ...changes, updatedAt: new Date() } },
            { returnDocument: "after" }
        );
    } catch (error) {
        rethrowDuplicate(error);
    }
};

const remove = async _id => {
    const courses = await getCollection();
    return courses.findOneAndDelete({ _id });
};

// const getCourseDetails = async _id => {
//     const courses = await getCollection();
//     return courses.aggregate([
//         { $match: { _id } },
//         {
//             $lookup: {
//                 from: "categories",
//                 localField: "category",
//                 foreignField: "_id",
//                 as: "category"
//             }
//         },
//         { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
//         {
//             $lookup: {
//                 from: "sessions",
//                 localField: "_id",
//                 foreignField: "course",
//                 as: "sessions"
//             }
//         },
//         {
//             $lookup: {
//                 from: "comments",
//                 localField: "_id",
//                 foreignField: "course",
//                 as: "comments"
//             }
//         }
//     ]).next();
// };

const getCourseDetails = async _id => {
    const courses = await getCollection();
    return courses.aggregate([
        // 1. Find the course
        { $match: { _id } },

        // 2. Get the Category (and flatten it)
        {
            $lookup: {
                from: "categories",
                localField: "category",
                foreignField: "_id",
                as: "categoryData"
            }
        },
        { $unwind: { path: "$categoryData", preserveNullAndEmptyArrays: true } },

        // 3. Get Sessions 
        {
            $lookup: {
                from: "sessions",
                localField: "_id",
                foreignField: "course",
                as: "sessions"
            }
        },

        // 4. Get Comments  needs to send the commenters data too.
        {
            $lookup: {
                from: "comments",
                localField: "_id",
                foreignField: "course",
                as: "comments"
            }
        },

        // 5. Get Students Count (Assuming collection name is course_users)
        {
            $lookup: {
                from: "course_users",
                localField: "_id",
                foreignField: "course",
                as: "enrolledStudents"
            }
        },

        // 6. Add the count and replace category with categoryData
        {
            $addFields: {
                courseStudentsCount: { $size: "$enrolledStudents" },
                category: "$categoryData" // Swap the category field
            }
        },

        // 7. Remove the temporary arrays we created
        { $unset: ["enrolledStudents", "categoryData"] },

        // 8. MAGIC STEP: Merge the current course into the root
        // (Wait, in your screenshot, the course is already wrapped. 
        // If it is wrapped because of a previous $group, use $replaceRoot).
        // Assuming the above $lookups leave the root document intact:
        {
            $replaceRoot: { newRoot: "$$ROOT" }
        }
    ]).next();
};

module.exports = { init, find, findById, create, update, remove, getCourseDetails };