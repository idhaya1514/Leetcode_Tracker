Remove-Item -Path "c:\Users\idhay\Downloads\Leetcode_Tracker\Sscet_Tracker\backend\*" -Recurse -Force
cd c:\Users\idhay\Downloads\Leetcode_Tracker\Sscet_Tracker\backend
npm init -y
npm install express cors dotenv bcrypt jsonwebtoken multer xlsx csv-parser @prisma/client
npm install --save-dev prisma nodemon typescript @types/node @types/express @types/cors ts-node
npx prisma init
