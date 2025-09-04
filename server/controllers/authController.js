const prisma =require('../prismaClient')
const jwt=require('jsonwebtoken')
const bcrypt=require('bcrypt')

const JWT_SECRET=process.env.JWT_SECRET || 'ex ness'
async function signup(req,res){
    const {username,password,email,phone}=req.body
    try{
        //password +salt round
        const hashedPassword=await bcrypt.hash(password,10)
        const user=await prisma.user.create({
            data:{
                username,
                email,
                phone,
                password:hashedPassword,
                balance:5000
            }
        })
        res.json({message:'User created successfully',userId:user.id})
    }catch(err){
        console.error('Error during signup:',err)
        res.status(500).json({error:'Internal server error'})
    }
}

async function login(req,res){
    const {email,password}=req.body
    try{
        const user=await prisma.user.findUnique({where:{email}})
        if(!user){
            return res.status(401).json({error:'Invalid email or password'})
        }
        const validPassword=await bcrypt.compare(password,user.password)
        if(!validPassword){
            return res.status(401).json({error:'Invalid email or password'})
        }
        const token = jwt.sign(
          { userId: user.userId, username: user.username, email: user.email },
          JWT_SECRET,
          { expiresIn: "1h" }
        );
        res.json({message:'Login successful',token,username:user.username,balance:user.balance})
    }
    catch(err){
        res.status(500).json({error:'Internal server error',err})
    }
}

async function me(req, res) {
  try {
    const user = await prisma.user.findUnique({
      where: { userId: req.user.userId },
      select: { userId: true, username: true, email: true, balance: true }
    });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = { signup, login, me };