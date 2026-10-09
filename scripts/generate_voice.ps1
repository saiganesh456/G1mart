Add-Type -AssemblyName System.Speech
$synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
$synth.SelectVoiceByHints([System.Speech.Synthesis.VoiceGender]::Female)
$synth.Rate = 0
$synth.Volume = 100

# 1. New Order voice
$targetPathOrder = Join-Path (Get-Location) "public\new_order_voice.wav"
$synth.SetOutputToWaveFile($targetPathOrder)
$synth.Speak("New order! New order!")
$synth.SetOutputToNull()
Write-Output "Successfully saved to $targetPathOrder"

# 2. New Slip voice
$targetPathSlip = Join-Path (Get-Location) "public\new_slip_voice.wav"
$synth.SetOutputToWaveFile($targetPathSlip)
$synth.Speak("New slip! New slip!")
$synth.SetOutputToNull()
Write-Output "Successfully saved to $targetPathSlip"
