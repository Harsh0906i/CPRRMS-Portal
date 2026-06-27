const Patient = require('../models/Patient');
const CancerDetails = require('../models/CancerDetails');
const Treatment = require('../models/Treatment');

exports.getDashboardStats = async (req, res, next) => {
  try {
    // 1) Total registered patients
    const totalPatients = await Patient.countDocuments();

    // 2) Active clinical cases
    const activeCases = await CancerDetails.countDocuments({
      status: 'Active Treatment'
    });

    // 3) New cases (registrations in the current calendar month)
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const newCases = await Patient.countDocuments({
      createdAt: { $gte: startOfMonth }
    });

    // 4) Cancer Type Distribution
    const cancerDistribution = await CancerDetails.aggregate([
      {
        $group: {
          _id: '$cancerType',
          count: { $sum: 1 }
        }
      },
      { $project: { name: '$_id', value: '$count', _id: 0 } }
    ]);

    // 5) Cancer Stage Distribution
    const stageDistribution = await CancerDetails.aggregate([
      {
        $group: {
          _id: '$stage',
          count: { $sum: 1 }
        }
      },
      { $project: { name: '$_id', value: '$count', _id: 0 } },
      { $sort: { name: 1 } }
    ]);

    // 6) Gender Distribution
    const genderDistribution = await Patient.aggregate([
      {
        $group: {
          _id: '$gender',
          count: { $sum: 1 }
        }
      },
      { $project: { name: '$_id', value: '$count', _id: 0 } }
    ]);

    // 7) Age Distribution (grouping into standard brackets)
    const ageDistribution = await Patient.aggregate([
      {
        $project: {
          age: {
            $floor: {
              $divide: [
                { $subtract: [new Date(), '$dob'] },
                365.25 * 24 * 60 * 60 * 1000
              ]
            }
          }
        }
      },
      {
        $bucket: {
          groupBy: '$age',
          boundaries: [0, 18, 35, 50, 65, 120],
          default: 'Other',
          output: {
            count: { $sum: 1 }
          }
        }
      },
      {
        $project: {
          name: {
            $switch: {
              branches: [
                { case: { $eq: ['$_id', 0] }, then: '0-17' },
                { case: { $eq: ['$_id', 18] }, then: '18-34' },
                { case: { $eq: ['$_id', 35] }, then: '35-49' },
                { case: { $eq: ['$_id', 50] }, then: '50-64' },
                { case: { $eq: ['$_id', 65] }, then: '65+' }
              ],
              default: 'Other'
            }
          },
          value: '$count',
          _id: 0
        }
      }
    ]);

    // 8) Monthly Registrations (Last 12 Months)
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setFullYear(twelveMonthsAgo.getFullYear() - 1);
    twelveMonthsAgo.setDate(1);
    twelveMonthsAgo.setHours(0, 0, 0, 0);

    const monthlyRegistrations = await Patient.aggregate([
      {
        $match: {
          createdAt: { $gte: twelveMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: {
          '_id.year': 1,
          '_id.month': 1
        }
      },
      {
        $project: {
          month: {
            $concat: [
              { $toString: '$_id.year' },
              '-',
              {
                $cond: {
                  if: { $lt: ['$_id.month', 10] },
                  then: { $concat: ['0', { $toString: '$_id.month' }] },
                  else: { $toString: '$_id.month' }
                }
              }
            ]
          },
          count: '$count',
          _id: 0
        }
      }
    ]);

    // 9) Treatment distribution (types & status success indicators)
    const treatmentDistribution = await Treatment.aggregate([
      {
        $group: {
          _id: '$treatmentType',
          count: { $sum: 1 }
        }
      },
      { $project: { name: '$_id', value: '$count', _id: 0 } }
    ]);

    const treatmentStatusDistribution = await Treatment.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      },
      { $project: { name: '$_id', value: '$count', _id: 0 } }
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        summary: {
          totalPatients,
          activeCases,
          newCases
        },
        distributions: {
          cancerDistribution,
          stageDistribution,
          genderDistribution,
          ageDistribution,
          monthlyRegistrations,
          treatmentDistribution,
          treatmentStatusDistribution
        }
      }
    });
  } catch (error) {
    next(error);
  }
};
